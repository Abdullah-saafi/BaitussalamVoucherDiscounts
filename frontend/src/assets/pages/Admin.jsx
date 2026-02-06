import React, { useState } from "react";
import CreateTech from "../componenets/CreateTech";
import CreateVou from "../componenets/CreateVou";
import ShowTechList from "../componenets/ShowTechList";
import ShowVou from "../componenets/ShowVou";

const Admin = () => {
  const [active, setActive] = useState("tech");

  const navButtons = [
    { id: "tech", label: "Add Lab Technician " },
    { id: "labTechList", label: "Lab Technicians" },
    { id: "vou", label: "Create Voucher" },
    { id: "ShowVou", label: "All Vouchers Lists" },
  ];

  const activeLabel = navButtons.find((btn) => btn.id === active)?.label;

  const renderContent = () => {
    switch (active) {
      case "tech":
        return <CreateTech />;
      case "labTechList":
        return <ShowTechList />;
      case "vou":
        return <CreateVou />;
      case "ShowVou":
        return <ShowVou />;
      default:
        return <CreateTech />;
    }
  };

  return (
    <div className="mb-20">
      <nav className="bg-blue-600 shadow-lg sticky top-0 z-50">
        <div className="px-10 py-2 ">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-white text-2xl font-bold">Admin Dashboard</h1>

            <div className="flex gap-2">
              {navButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setActive(btn.id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    active === btn.id
                      ? "bg-white text-blue-700 shadow-md"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <span className="hidden md:inline">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{activeLabel}</h2>
          <div className="h-1 w-20 bg-blue-600 rounded mt-2"></div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Admin;
