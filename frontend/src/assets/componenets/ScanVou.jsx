import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "../../utils/api";

const ScanVou = () => {
  const [cardData, setCardData] = useState(null);
  const [error, setError] = useState("");
  const [lastScanned, setLastScanned] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: 200,
    });

    scanner.render(handleScan);
    return () => scanner.clear();
  }, []);

  // Handle scan
  const handleScan = async (qrCode) => {
    if (qrCode === lastScanned) return;
    setLastScanned(qrCode);

    try {
      const response = await api.get(`http://localhost:5000/card/${qrCode}`);
      setCardData(response.data);
      setError("");

      // Auto-apply if card is active
      if (response.data.card.status === "active") {
        await autoApplyDiscount(response.data.card.cardNumber);
      }
    } catch (err) {
      setError("Card not found", err);
      setCardData(null);
    }
  };

  // Auto-apply discount
  const autoApplyDiscount = async (cardNumber) => {
    setApplying(true);
    try {
      await api.post("/use-card", {
        cardNumber: cardNumber,
      });

      // Refresh card to show new status
      const response = await api.get(
        `http://localhost:5000/card/${cardNumber}`,
      );
      setCardData(response.data);

      alert("✅ Discount applied! Card is now inactive.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply discount");
    } finally {
      setApplying(false);
    }
  };

  // Scan new card
  const scanAgain = () => {
    setCardData(null);
    setError("");
    setLastScanned("");
  };

  return (
    <div className="flex h-screen">
      {/* Left: Camera */}
      <div className="w-1/2 p-6 bg-white">
        <h2 className="text-2xl font-bold mb-4">📷 Scanner</h2>
        <div id="qr-reader"></div>
      </div>

      {/* Right: Details */}
      <div className="w-1/2 p-6 bg-gray-100 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">📄 Card Details</h2>

        {applying && (
          <div className="bg-blue-100 text-blue-700 p-4 rounded mb-4 animate-pulse">
            ⏳ Applying discount...
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded"> {error}</div>
        )}

        {!cardData && !error && (
          <p className="text-center text-gray-500 mt-20">
            👆 Scan a QR code to see details
          </p>
        )}

        {cardData && (
          <div className="space-y-4">
            {/* Discount Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold">
                {cardData.voucher.shopName}
              </h3>
              <p className="text-6xl font-bold mt-3">
                {cardData.voucher.discountPercentage}%
              </p>
              <p className="text-sm mt-2 opacity-90">DISCOUNT</p>
            </div>

            {/* Status Badge */}
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-2">Card Status:</p>
              <span
                className={`inline-block px-6 py-2 rounded-full font-bold text-lg ${
                  cardData.card.status === "active"
                    ? "bg-green-500 text-white"
                    : cardData.card.status === "inactive"
                      ? "bg-red-500 text-white"
                      : "bg-gray-500 text-white"
                }`}
              >
                {cardData.card.status === "active" && "✓ ACTIVE"}
                {cardData.card.status === "inactive" && "✗ INACTIVE"}
                {cardData.card.status === "expired" && "⌛ EXPIRED"}
              </span>
            </div>

            {/* Card Details */}
            <div className="bg-white p-4 rounded-lg shadow space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600 font-medium">Card Number:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {cardData.card.cardNumber}
                </span>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600 font-medium">
                  Applicable To:
                </span>
                <span className="text-sm">
                  {cardData.voucher.discountType === "all_tests"
                    ? "All Tests"
                    : cardData.voucher.specificTests.join(", ")}
                </span>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600 font-medium">Expires On:</span>
                <span className="text-sm">
                  {new Date(cardData.voucher.expiryDate).toLocaleDateString()}
                </span>
              </div>

              {cardData.card.usedAt && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-600 font-medium">Used At:</span>
                  <span className="text-sm">
                    {new Date(cardData.card.usedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Status Message */}
            {cardData.card.status === "inactive" && (
              <div className="bg-green-100 border-2 border-green-500 text-green-800 p-4 rounded-lg font-semibold text-center">
                ✅ Discount Applied Successfully!
                <br />
                <span className="text-sm font-normal">
                  Card is now inactive and cannot be used again.
                </span>
              </div>
            )}

            {cardData.card.status === "expired" && (
              <div className="bg-red-100 border-2 border-red-500 text-red-800 p-4 rounded-lg font-semibold text-center">
                ⚠️ This card has expired
              </div>
            )}

            {/* Scan Another Button */}
            <button
              onClick={scanAgain}
              className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg shadow-lg"
            >
              🔄 Scan Another Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanVou;
