import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { useAuth } from "../context/auth";

export const QuoteCreation = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First upload the image
      const formData = new FormData();
      formData.append("file", file);

      const mediaResponse = await fetch(
        "https://crafto.app/crafto/v1.0/media/assignment/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const mediaData = await mediaResponse.json();

      // Then create the quote
      const quoteResponse = await fetch(
        "https://assignment.stage.crafto.app/postQuote",
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            mediaUrl: mediaData.mediaUrl,
          }),
        }
      );

      if (quoteResponse.ok) {
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to create quote:", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Create Quote
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Quote Text"
              margin="normal"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <input
              accept="image/*"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ marginTop: 16, marginBottom: 16 }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              sx={{ mt: 3 }}
              disabled={!text || !file}
            >
              Create Quote
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};
// export default QuoteCreation;
