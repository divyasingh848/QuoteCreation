// pages/QuoteListPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Fab,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../context/auth";

export const QuoteList = () => {
  const [quotes, setQuotes] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();
  const limit = 20;

  const loadQuotes = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Making request with token:", token); // Debug token

      const response = await fetch(
        `https://assignment.stage.crafto.app/getQuotes?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status); // Debug response status

      const data = await response.json();
      console.log("Raw API Response:", data); // Debug raw response

      // Handle different response formats
      let quotesToAdd = [];
      if (data.data && Array.isArray(data.data)) {
        quotesToAdd = data.data;
      } else if (data.quotes && Array.isArray(data.quotes)) {
        quotesToAdd = data.quotes;
      } else if (Array.isArray(data)) {
        quotesToAdd = data;
      } else if (typeof data === "object" && data !== null) {
        // If it's an object but not in expected format, try to extract quotes
        console.log(
          "Unexpected data format, attempting to extract quotes:",
          data
        );
        quotesToAdd = Object.values(data).filter(
          (item) =>
            item && typeof item === "object" && item.text && item.mediaUrl
        );
      }

      console.log("Processed quotes:", quotesToAdd); // Debug processed quotes

      if (quotesToAdd.length === 0) {
        setHasMore(false);
      } else {
        setQuotes((prevQuotes) => {
          const newQuotes = [...prevQuotes, ...quotesToAdd];
          console.log("Updated quotes state:", newQuotes);
          return newQuotes;
        });
        setOffset((prev) => prev + limit);
      }
    } catch (error) {
      console.error("Detailed error:", error); // Debug error details
      setError(`Failed to load quotes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasMore) {
      loadQuotes();
    }
  }, []);

  const handleCreateClick = () => {
    navigate("/create");
  };

  // Render data for debugging
  const renderDebugInfo = () => (
    <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
      <Typography variant="subtitle2">Debug Info:</Typography>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(
          {
            quotesCount: quotes.length,
            hasMore,
            offset,
            loading,
            error,
          },
          null,
          2
        )}
      </pre>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && <Alert severity="error">{error}</Alert>}

      {/* Debug info in development */}
      {process.env.NODE_ENV === "development" && renderDebugInfo()}

      <Grid container spacing={3}>
        {quotes.map((quote, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  height="300"
                  image={quote.mediaUrl || "https://via.placeholder.com/300"}
                  alt="Quote image"
                  sx={{ objectFit: "cover" }}
                  onError={(e) => {
                    console.log("Image load error for:", quote.mediaUrl);
                    e.target.src = "https://via.placeholder.com/300";
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    color: "white",
                    background: "rgba(0,0,0,0.6)",
                    wordBreak: "break-word",
                  }}
                >
                  {quote.text || "No text available"}
                </Typography>
              </Box>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  By {quote.username || "Anonymous"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {quote.created_at
                    ? new Date(quote.created_at).toLocaleDateString()
                    : "Date not available"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && quotes.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No quotes found. Create your first quote!
          </Typography>
        </Box>
      )}

      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={handleCreateClick}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};
