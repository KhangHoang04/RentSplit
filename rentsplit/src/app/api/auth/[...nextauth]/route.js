import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectToDB from "@/core/db/mongodb";
import { UserModel } from "@/core/models/User";
import { session } from "@/core/session";

// Define your NextAuth configuration
const authOptions = {
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
          await connectToDB(); // Connect to the DB (assuming it's MongoDB)

          let userExists = await UserModel.findOne({ email });

          // If user does not exist, create a new one
          if (!userExists) {
            userExists = await UserModel.create({
              username: name,
              email,
              google_id: id,
              profileImage: image,
            });
          }
          return true; // Successful sign-in
        } catch (error) {
          console.error("Error in sign-in callback:", error);
          return false; // Return false in case of an error
        }
      }
      return true; // For other providers, continue with default behavior
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
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
