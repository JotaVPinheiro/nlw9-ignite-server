import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";

import {
  convertHoursStringToMinutes,
  convertMinutesToHoursString,
} from "./utils";

const app = express();
const prisma = new PrismaClient({ log: ["query", "error"] });

app.use(express.json());
app.use(cors());

app.get("/games", async (request, response) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });

  return response.json(games);
});

app.post("/games/:id/ads", async (request, response) => {
  const {
    body,
    params: { id: gameId },
  } = request;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      ...body,
      hoursStart: convertHoursStringToMinutes(body.hoursStart),
      hoursEnd: convertHoursStringToMinutes(body.hoursEnd),
    },
  });

  return response.json(ad);
});

app.get("/games/:id/ads", async (request, response) => {
  const { id: gameId } = request.params;

  const gameAds = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      yearsPlaying: true,
      weekDays: true,
      hoursStart: true,
      hoursEnd: true,
      useVoiceChannel: true,
    },
    where: { gameId },
    orderBy: { createdAt: "desc" },
  });

  return response.json(
    gameAds.map((gameAd) => ({
      ...gameAd,
      hoursStart: convertMinutesToHoursString(gameAd.hoursStart),
      hoursEnd: convertMinutesToHoursString(gameAd.hoursEnd),
    }))
  );
});

app.get("/ads/:id/discord", async (request, response) => {
  const { id } = request.params;

  const ad = await prisma.ad.findUnique({
    select: {
      discord: true,
    },
    where: { id },
  });

  return response.json(ad);
});

app.listen(3333, () => console.log("Server running at port 3333!"));
