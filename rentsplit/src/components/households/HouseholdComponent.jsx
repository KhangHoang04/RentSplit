'use client';
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Users, UserPlus, UserMinus } from "lucide-react";
import Sidebar from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const HouseholdPage = ({ user }) => {
  const [households, setHouseholds] = useState([]);
  const [activeHousehold, setActiveHousehold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [removingMemberId, setRemovingMemberId] = useState(null);

  const handleAddMember = async () => {
    if (!newMemberEmail) return;
  
    setLoading(true);
    try {
      const res = await fetch(`/api/household/${activeHousehold._id}/member/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newMemberEmail, householdName: activeHousehold.name }),
      });
  
      const data = await res.json();
      if (res.ok) {
        alert("Member added!");
        setActiveHousehold((prev) => ({
          ...prev,
          members: [...prev.members, { _id: data.userId, email: newMemberEmail }],
        }));
        setNewMemberEmail("");
        setShowEmailInput(false);
      } else {
        alert(`Failed to add member: ${data.message}`);
      }
    } catch (err) {
      console.error("Add member error:", err);
      alert("Error adding member.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveMember = async (memberEmail, memberId) => {
    const confirmed = confirm("Are you sure you want to remove this member?");
    if (!confirmed) return;
    
    setRemovingMemberId(memberId);
    try {
      const res = await fetch(`/api/household/${activeHousehold._id}/member/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: memberEmail }),
      });
  
      const data = await res.json();
      if (res.ok) {
        alert("Member removed!");
        setActiveHousehold((prev) => ({
          ...prev,
          members: prev.members.filter((m) => m._id !== memberId),
        }));
      } else {
        alert(`Failed to remove member: ${data.message}`);
      }
    } catch (err) {
      console.error("Remove member error:", err);
      alert("Error removing member.");
    } finally {
      setRemovingMemberId(null);
    }
  };  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, householdsRes] = await Promise.all([
          fetch("/api/user"),
          fetch("/api/household/get"),
        ]);
  
        const userData = await userRes.json();
        const householdsData = await householdsRes.json();
  
        if (userRes.ok) setCurrentUser(userData);
        if (householdsRes.ok) setHouseholds(householdsData.households);
        else console.error("Failed to fetch households:", householdsData.message);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);  

  return (
    <div className="flex">
      <Sidebar user={user} />
      <div className="flex-1 ml-64 p-6">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-black">Your Households</h1>
          <Link href="/households/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} className="mr-2" />
              Create Household
            </Button>
          </Link>
        </header>

        {loading ? (
          <p className="text-black">Loading households...</p>
        ) : households.length === 0 ? (
          <p className="text-black">You're not part of any households yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {households.map((house) => (
              <Card
                key={house._id}
                onClick={() => setActiveHousehold(house)}
                className="cursor-pointer hover:shadow-lg transition"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-black">
                    <span>{house.name}</span>
                    <Users size={20} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-black">{house.members.length} member(s)</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeHousehold && (
          <div className="mt-10">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex justify-between items-center text-black">
                  <span>Manage Members – {activeHousehold.name}</span>
                  <Button variant="outline" onClick={() => setActiveHousehold(null)} className="text-black">Close</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {activeHousehold.members.map((member, idx) => (
                      <div
                        key={member._id || idx}
                        className="flex justify-between items-center border rounded-md p-3"
                      >
                        <div>
                          <p className="font-medium text-black">{member.username ? member.username : member.email}</p>
                          <Badge variant="outline" className="text-black">
                            {activeHousehold.admin === member._id ? "Owner" : "Member"}
                          </Badge>
                        </div>
                        {activeHousehold.admin && currentUser && 
                          activeHousehold.admin._id === currentUser._id && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveMember(member.email, member._id)}
                            disabled={removingMemberId === member._id}
                            className="text-white"
                          >
                            <UserMinus size={16} className="mr-1" />
                            {removingMemberId === member._id ? "Removing..." : "Remove"}
                          </Button>
                        )}
                      </div>
                    ))}

                    {activeHousehold.admin && currentUser && 
                      activeHousehold.admin._id === currentUser._id && (
                      <div className="mt-4 space-y-2">
                        {!showEmailInput ? (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => setShowEmailInput(true)}
                          >
                            <UserPlus size={16} className="mr-1" />
                            Add Member
                          </Button>
                        ) : (
                          <div className="flex gap-2 items-center">
                            <input
                              type="email"
                              placeholder="member@example.com"
                              value={newMemberEmail}
                              onChange={(e) => setNewMemberEmail(e.target.value)}
                              className="border p-2 rounded-md w-full max-w-sm text-sm text-black"
                            />
                            <Button 
                              size="sm" 
                              onClick={handleAddMember} 
                              disabled={loading}
                              className="text-white"
                            >
                              {loading ? "Adding..." : "Submit"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setShowEmailInput(false);
                                setNewMemberEmail("");
                              }}
                              className="text-black"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4">
                      <Link href={`/households/${activeHousehold._id}/expenses`}>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          Manage Expenses
                        </Button>
                      </Link>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseholdPage;