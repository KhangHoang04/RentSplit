'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "../ui/lable";
import { Users, Upload, Loader2, X } from "lucide-react";
import { CldUploadButton } from "next-cloudinary";
import Sidebar from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

const CreateHouseholdPage = ({ user }) => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [groupPhoto, setGroupPhoto] = useState("");
  const [loading, setLoading] = useState(false);
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState([]);

  const handleAddMember = () => {
    const trimmed = memberInput.trim();
    if (trimmed && !members.includes(trimmed)) {
      setMembers([...members, trimmed]);
    }
    console.log(members)
    setMemberInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddMember();
    }
  };

  const handleRemoveMember = (emailToRemove) => {
    setMembers(members.filter((email) => email !== emailToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/household/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          groupPhoto,
          members,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        router.push("/households");
      } else {
        console.error(data.message || "Failed to create household");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar user={user} />
      <div className="flex-1 ml-64 p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create Household</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Household Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="image">Group Photo</Label>
                <div className="mt-1 flex flex-col items-start">
                    <CldUploadButton
                    options={{ maxFiles: 1 }}
                    folder="group_images"
                    uploadPreset="q8iforrb"
                    onSuccess={(result) =>
                        setGroupPhoto(result?.info?.secure_url || "")
                    }
                    onFailure={(error) =>
                        console.error("Cloudinary upload error:", error)
                    }
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
                    >
                    Upload Image
                    </CldUploadButton>

                    {groupPhoto && (
                    <img
                        src={groupPhoto}
                        alt="Group"
                        className="mt-2 w-32 h-32 rounded-md object-cover border"
                    />
                    )}
                </div>
                </div>


              <div>
                <Label htmlFor="member">Add Members by Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="member"
                    type="email"
                    placeholder="member@example.com"
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button type="button" variant="outline" onClick={handleAddMember}>
                    <Users size={16} className="mr-2" />
                    Add
                  </Button>
                </div>

                {members.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <ScrollArea className="max-h-40 border p-3 rounded-md">
                      {members.map((email, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center border px-3 py-2 rounded-md text-sm"
                        >
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(email)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={18} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2" size={18} />
                    Create Household
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateHouseholdPage;
