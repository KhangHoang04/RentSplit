import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectToDB from "@/core/db/mongodb";
import { UserModel } from "@/core/models/User";
import { session } from "@/core/session";

// Define your NextAuth configuration
export const authOptions = {
  session: {
    strategy: "jwt", // Use JWT for session management
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // SignIn callback - creates a new user or finds an existing user from MongoDB
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        const { name, email, image, id } = user;
    
        try {
          await connectToDB();
          let userExists = await UserModel.findOne({ email });
    
          if (userExists) {
            // ✅ If status is 'invited', upgrade them to 'active' and update info
            if (userExists.status === "invited") {
              userExists.username = name;
              userExists.google_id = id;
              userExists.profileImage = image;
              userExists.status = "active";
              await userExists.save();
            }
          } else {
            // ✅ New user: create normally
            userExists = await UserModel.create({
              username: name,
              email,
              google_id: id,
              profileImage: image,
              status: "active", // set status explicitly
            });
          }
    
          return true;
        } catch (error) {
          console.error("Error in sign-in callback:", error);
          return false;
        }
      }
    
      return true;
    },
    session,
    // JWT callback to store additional data in the JWT (e.g., user ID)
    async jwt({ token, user, account, profile }) {
      if (profile) {
        // Here we fetch the user from MongoDB based on the profile data
        const userExists = await UserModel.findOne({ email: profile.email });
        if (!userExists) {
          throw new Error("No user found");
        }
        token.id = userExists._id; // Attach the user ID to the token
        token.email = userExists.email; // Attach email (if needed)
      }
      return token; // Return the modified token
    },
    async redirect({ url, baseUrl }) {
      // Check if the user is coming from a valid redirect URL
      if (url === baseUrl || url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard`; // Redirect to /dashboard after sign-in
      }
      return url; // Default behavior
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
