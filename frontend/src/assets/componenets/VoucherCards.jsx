import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";
import html2canvas from "html2canvas";
import { QRCode } from "react-qr-code";
import jsPDF from "jspdf";

const VoucherCards = () => {
  const { id } = useParams();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cardsPerPage, setCardsPerPage] = useState(6);
  const cardsRef = useRef([]);
  const buttonRefs = useRef([]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await api.get(
          `http://localhost:5000/voucher/${id}/cards`,
        );
        setCards(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch cards");
        setLoading(false);
      }
    };
    fetchCards();
  }, [id]);

  const downloadCard = async (index) => {
    const element = cardsRef.current[index];
    const button = buttonRefs.current[index];
    if (!element) return;

    try {
      if (button) button.style.display = "none";

      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector(
            `[data-card-index="${index}"]`,
          );
          if (clonedElement) {
            clonedElement.style.background =
              "linear-gradient(135deg, rgb(254, 249, 195), rgb(253, 230, 138))";
          }
        },
      });

      const link = document.createElement("a");
      link.download = `${cards[index].cardNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      if (button) button.style.display = "block";
    } catch (err) {
      console.error("Error downloading card:", err);
      alert(`Failed to download card: ${err.message}`);
      if (button) button.style.display = "block";
    }
  };

  const downloadAllCards = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate layout based on cardsPerPage
      let cols, rows;
      if (cardsPerPage === 6) {
        cols = 2;
        rows = 3;
      } else if (cardsPerPage === 8) {
        cols = 2;
        rows = 4;
      } else {
        cols = 2;
        rows = 3;
      }
      
      const cardWidth = (pageWidth - 20) / cols; // 10mm margin on each side
      const cardHeight = (pageHeight - 20) / rows; // 10mm margin top/bottom
      const margin = 10;
      
      for (let i = 0; i < cards.length; i++) {
        const element = cardsRef.current[i];
        const button = buttonRefs.current[i];
        
        if (!element) continue;
        
        // Hide button before capture
        if (button) button.style.display = "none";
        
        // Capture card as canvas
        const canvas = await html2canvas(element, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector(
              `[data-card-index="${i}"]`,
            );
            if (clonedElement) {
              clonedElement.style.background =
                "linear-gradient(135deg, rgb(254, 249, 195), rgb(253, 230, 138))";
            }
          },
        });
        
        // Show button again
        if (button) button.style.display = "block";
        
        // Convert canvas to image
        const imgData = canvas.toDataURL("image/png");
        
        // Calculate position on page
        const positionOnPage = i % cardsPerPage;
        const col = positionOnPage % cols;
        const row = Math.floor(positionOnPage / cols);
        
        // Add new page if needed (except for first card)
        if (i > 0 && positionOnPage === 0) {
          pdf.addPage();
        }
        
        // Calculate x and y position
        const x = margin + (col * cardWidth);
        const y = margin + (row * cardHeight);
        
        // Add image to PDF
        pdf.addImage(imgData, "PNG", x, y, cardWidth - 2, cardHeight - 2);
      }
      
      // Save PDF
      pdf.save(`voucher-cards-${id}.pdf`);
      alert(`Successfully downloaded ${cards.length} cards as PDF (${cardsPerPage} cards per page)!`);
    } catch (err) {
      console.error("Error creating PDF:", err);
      alert(`Failed to create PDF: ${err.message}`);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading cards...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h2
        className="text-3xl font-bold mb-6 text-center"
        style={{ color: "#1f2937" }}
      >
        Voucher Cards
      </h2>

      <div className="mb-6 flex gap-4 items-center">
        <div>
          <label className="mr-2 font-semibold">Cards per PDF page:</label>
          <select
            value={cardsPerPage}
            onChange={(e) => setCardsPerPage(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded"
          >
            <option value={6}>6 cards (2x3)</option>
            <option value={8}>8 cards (2x4)</option>
          </select>
        </div>
        
        <button
          onClick={downloadAllCards}
          className="px-6 py-3 rounded transition"
          style={{ backgroundColor: "#22c55e", color: "#ffffff" }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#16a34a")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#22c55e")}
        >
          Download All as PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
        {cards.map((card, index) => (
          <div
            key={card.cardNumber}
            ref={(el) => (cardsRef.current[index] = el)}
            data-card-index={index}
            style={{
              width: "25rem",
              background:
                "linear-gradient(135deg, rgb(254, 249, 195), rgb(253, 230, 138))",
              border: "2px solid rgb(250, 204, 21)",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <img
              src="/imgs/Logo.jpg"
              alt="Baitusslam Logo"
              style={{ width: "80px", height: "80px", marginBottom: "12px" }}
              crossOrigin="anonymous"
            />

            <h1
              style={{
                fontSize: "2.25rem",
                fontWeight: "bold",
                color: "rgb(113, 63, 18)",
                marginBottom: "4px",
              }}
            >
              Baitusslam
            </h1>

            <p
              style={{
                color: "rgb(55, 65, 81)",
                fontStyle: "italic",
                marginBottom: "12px",
              }}
            >
              Es Ramzan apki sehat ka Zamin
            </p>

            <p
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                marginBottom: "4px",
                color: "rgb(17, 24, 39)",
              }}
            >
              {card.shopName}
            </p>

            <p
              style={{
                fontSize: "2.25rem",
                fontWeight: "bold",
                color: "rgb(22, 163, 74)",
                marginBottom: "8px",
                lineHeight: "1.2",
              }}
            >
              Apki Dawa <br /> Ghareeb ki Madad
            </p>

            <p
              style={{
                color: "rgb(55, 65, 81)",
                fontSize: "0.875rem",
                marginBottom: "16px",
              }}
            >
              Apki zakat/khairat ka behatreen masraf
            </p>

            <div style={{ marginBottom: "12px" }}>
              <QRCode value={card.qrCode} size={128} />
            </div>

            <p
              style={{
                color: "rgb(31, 41, 55)",
                fontWeight: "600",
                marginBottom: "4px",
              }}
            >
              {card.cardNumber}
            </p>

            <button
              ref={(el) => (buttonRefs.current[index] = el)}
              onClick={() => downloadCard(index)}
              style={{
                marginTop: "auto",
                padding: "0.5rem 1rem",
                backgroundColor: "rgb(59, 130, 246)",
                color: "rgb(255, 255, 255)",
                borderRadius: "0.25rem",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "rgb(37, 99, 235)")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "rgb(59, 130, 246)")
              }
            >
              Download Card
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoucherCards;
