import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, test } from "@jest/globals";
import request from "supertest";

import app from "../src/app.js";
import config from "../src/config/config.js";
import Category from "../src/models/Category.js";
import Ingredient from "../src/models/Ingredient.js";
import Recipe from "../src/models/Recipe.js";
import User from "../src/models/User.js";

const unique = (): string => `${Date.now()}-${Math.round(Math.random() * 100000)}`;

describe("Recipe APIs", () => {
  let token = "";
  let ingredientId = "";
  let userId = "";

  beforeEach(async () => {
    const suffix = unique();
    const user = await User.create({
      username: `testuser-${suffix}`,
      email: `test-${suffix}@example.com`,
      password: "password123",
      firstName: "Test",
      lastName: "User",
      role: "user",
      language: "en",
    });

    userId = user._id.toString();
    token = jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: "1h" });

    const category = await Category.create({
      name: { en: `Main Category ${suffix}` },
      slug: `main-category-${suffix}`,
      level: 0,
      isActive: true,
    });

    const ingredient = await Ingredient.create({
      name: { en: `Ingredient ${suffix}` },
      slug: `ingredient-${suffix}`,
      category: category._id,
      isActive: true,
      tags: [],
    });

    ingredientId = ingredient._id.toString();
  });

  test("create recipe (auth required)", async () => {
    const response = await request(app)
      .post("/api/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        dishName: { en: "Test Sambar" },
        location: { country: "India" },
        description: { en: "A simple test recipe" },
        ingredients: [{ ingredient: ingredientId, quantity: "1 cup", unit: "cup" }],
        steps: [{ step: 1, description: { en: "Cook and serve" } }],
        difficulty: "easy",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.dishName.en).toBe("Test Sambar");
  });

  test("get recipes (public)", async () => {
    await Recipe.create({
      dishName: { en: "Public Recipe" },
      slug: `public-recipe-${unique()}`,
      location: { country: "India" },
      description: { en: "Visible public recipe" },
      ingredients: [{ ingredient: ingredientId, quantity: "1", unit: "cup" }],
      steps: [{ step: 1, description: { en: "Serve hot" } }],
      difficulty: "easy",
      createdBy: userId,
      isPublic: true,
      isApproved: true,
    });

    const response = await request(app).get("/api/recipes");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});
