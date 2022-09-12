import express from "express";

const app = express();

app.get("/", (request, response) => {
  return response.json({ never_gonna: "give you up" });
});

app.listen(3333, () => console.log("Server running at port 3333!"));
