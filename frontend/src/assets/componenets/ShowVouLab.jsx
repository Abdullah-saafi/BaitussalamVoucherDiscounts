import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import QRCode from "react-qr-code";

const ShowVouLabTech = () => {
  const [vouchers, setVouchers] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [searchNumber, setSearchNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vouchers");
      setVouchers(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load vouchers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const getShopList = () => {
    const shops = [...new Set(vouchers.map((v) => v.shopName))];
    return shops.sort();
  };

  const getCardsFromSelectedShop = () => {
    if (!selectedShop) return [];

    const shopVouchers = vouchers.filter((v) => v.shopName === selectedShop);

    const allCards = [];

    shopVouchers.forEach((voucher) => {
      voucher.cards.forEach((card) => {
        allCards.push({
          ...card,
          discount: voucher.discountPercentage,
          expiryDate: voucher.expiryDate,
          discountType: voucher.discountType,
          specificTests: voucher.specificTests,
        });
      });
    });

    if (searchNumber.trim()) {
      return allCards.filter((card) =>
        card.cardNumber
          .toLowerCase()
          .includes(searchNumber.toLowerCase().trim()),
      );
    }

    return allCards;
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">
          Say Suban Allah Until Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
      </div>
    );
  }

  const shopList = getShopList();
  const displayCards = getCardsFromSelectedShop();

  return (
    <div className="p-6 mb-10">
      <h2 className="text-3xl font-bold mb-2 text-gray-800">
        Show All Voucher Cards
      </h2>
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xl font-extrabold mb-2">
              Select Shop
            </label>
            <select
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="">-- Choose a Shop --</option>
              {shopList.map((shop) => (
                <option key={shop} value={shop}>
                  {shop}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xl font-extrabold mb-2">
              Search Card
            </label>
            <input
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              disabled={!selectedShop}
              className="w-full px-4 py-2 border rounded"
              placeholder="Card number..."
            />
          </div>
        </div>
      </div>

      {!selectedShop ? (
        <p className="text-center text-gray-500">Select a shop to view cards</p>
      ) : displayCards.length === 0 ? (
        <p className="text-center text-gray-500">No cards found</p>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full border border-gray-400 border-collapse">
            <thead className="bg-blue-600 text-white text-xl">
              <tr>
                <th className="border border-gray-400 p-3 text-left">
                  Card No:
                </th>
                <th className="border border-gray-400 p-3 text-center">QR</th>
                <th className="border border-gray-400 p-3 text-center">
                  Discount
                </th>
                <th className="border border-gray-400 p-3 text-center">
                  Status
                </th>
                <th className="border border-gray-400 p-3 text-left">
                  Used By
                </th>
                <th className="border border-gray-400 p-3 text-left">
                  Used At
                </th>
              </tr>
            </thead>

            <tbody>
              {displayCards.map((card) => (
                <tr key={card.cardNumber}>
                  <td className="border border-gray-400 p-3 font-mono">
                    {card.cardNumber}
                  </td>

                  <td className="border border-gray-400 p-3 flex justify-center">
                    <QRCode value={card.qrCode} size={70} />
                  </td>

                  <td className="border border-gray-400 p-3 text-center">
                    {card.discount}%
                  </td>

                  <td className="border border-gray-400 p-3 text-center">
                    <span
                      className={`px-3 py-1 rounded text-white text-xs ${
                        card.status === "active"
                          ? "bg-green-500"
                          : card.status === "used"
                            ? "bg-gray-500"
                            : "bg-red-500"
                      }`}
                    >
                      {card.status}
                    </span>
                  </td>

                  <td className="border border-gray-400 p-3">
                    {card.usedBy || "-"}
                  </td>

                  <td className="border border-gray-400 p-3">
                    {card.usedAt
                      ? new Date(card.usedAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ShowVouLabTech;
