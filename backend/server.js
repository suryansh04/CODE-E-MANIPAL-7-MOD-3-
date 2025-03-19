import express from "express";
import axios from "axios";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors());

app.post("/input-data", async (req, res) => {
  try {
    const { data } = req.body;
    console.log("Request data:", data);

    // Format data according to FastAPI's expected schema
    const response = await axios.post("http://localhost:8000/process-data", {
      prompt: data, // Change 'data' to 'prompt' or whatever field name FastAPI expects
    });

    res.json({ message: "Data sent to FastAPI", response: response.data });
  } catch (error) {
    console.log("Error forwarding to fastAPI", error.message);

    // If we get a response with status, include that in the error
    if (error.response) {
      console.log("Response status:", error.response.status);
      console.log("Response data:", error.response.data);
      res.status(error.response.status).json({
        error: "Failed to process data with FastAPI",
        details: error.response.data,
      });
    } else {
      res.status(500).json({ error: "Failed to send data to FastAPI" });
    }
  }
});

app.listen(3001, () => {
  console.log("server is running on port 3001");
});
