import Voucher from "../models/Voucher.js";
import { v4 as uuidv4 } from "uuid";

export const createVoucher = async (req, res) => {
  const {
    shopName,
    idName,
    partnerArea,
    discountType,
    specificTests,
    discountPercentage,
    expiryDate,
    totalCards,
  } = req.body;

  try {
    const cards = [];

    for (let i = 0; i < totalCards; i++) {
      const cardNumber = `${idName}-${Date.now()}-${uuidv4()
        .slice(0, 4)
        .toUpperCase()}`;

      cards.push({
        cardNumber,
        qrCode: cardNumber,
        status: "active",
      });
    }

    const voucher = new Voucher({
      shopName,
      idName,
      partnerArea,
      discountType,
      specificTests: discountType === "specific_tests" ? specificTests : [],
      discountPercentage,
      expiryDate,
      totalCards,
      cards,
    });

    await voucher.save();
    res.status(201).json({ message: "Voucher created", voucher });
  } catch (err) {
    res.status(500).json({ message: "Server error" }, err);
  }
};

export const getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.status(200).json(vouchers);
  } catch (err) {
    res.status(500).json({ message: "Server error" }, err);
  }
};

export const getVoucherCards = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Not found" });

    res.status(200).json(voucher.cards);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Not found" });

    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getCardDetails = async (req, res) => {
  try {
    const value = req.params.cardNumber;

    const voucher = await Voucher.findOne({
      $or: [{ "cards.cardNumber": value }, { "cards.qrCode": value }],
    });

    if (!voucher) return res.status(404).json({ message: "Card not found" });

    const card = voucher.cards.find(
      (c) => c.cardNumber === value || c.qrCode === value,
    );

    res.status(200).json({
      card,
      voucher: {
        shopName: voucher.shopName,
        discountPercentage: voucher.discountPercentage,
        discountType: voucher.discountType,
        specificTests: voucher.specificTests,
        expiryDate: voucher.expiryDate,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Use card
export const useCard = async (req, res) => {
  const { cardNumber, usedBy } = req.body;

  console.log("useCard body:", req.body);

  try {
    const voucher = await Voucher.findOne({
      "cards.cardNumber": cardNumber,
    });

    if (!voucher) {
      return res.status(404).json({ message: "Card not found" });
    }

    const card = voucher.cards.find((c) => c.cardNumber === cardNumber);

    if (!card) {
      return res.status(404).json({ message: "Card not found in voucher" });
    }

    if (card.status !== "active") {
      return res.status(400).json({ message: `Card is ${card.status}` });
    }

    if (new Date(voucher.expiryDate) < new Date()) {
      card.status = "expired";
      await voucher.save();
      return res.status(400).json({ message: "Card expired" });
    }

    // ✅ SAVE EVERYTHING
    card.status = "used";
    card.usedAt = new Date();
    card.usedBy = usedBy || "Unknown";

    await voucher.save();

    return res.status(200).json({
      message: "Discount applied",
      card,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
