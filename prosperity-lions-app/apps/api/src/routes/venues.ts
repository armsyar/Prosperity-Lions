import { Router } from "express";
import venues from "@prosperity-lions/shared/venues.json" with { type: "json" };

export const venuesRouter = Router();

// GET /api/venues?category=restaurant&dietary=vegetarian
venuesRouter.get("/", (req, res) => {
  const { category } = req.query;
  const all = [...venues.restaurants, ...venues.attractions, ...venues.hotels, ...venues.retail];
  const filtered = category ? all.filter((v) => v.type === category) : all;
  res.json(filtered);
});
