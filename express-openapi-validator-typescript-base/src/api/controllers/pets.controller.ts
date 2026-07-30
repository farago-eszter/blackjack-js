import { Request, Response } from "express";

export interface Pet {
  id: number;
  name: string;
  type: string;
  tags: string[];
}

export let pets: Pet[] = [
  {
    id: 1,
    name: "sparky",
    type: "dog",
    tags: ["sweet"],
  },
  {
    id: 2,
    name: "buzz",
    type: "cat",
    tags: ["purrfect"],
  },
  {
    id: 3,
    name: "max",
    type: "dog",
    tags: ["sweet", "purrfect", "white"],
  },
];
let creationId: number = 4;

export function getPets(req: Request, res: Response) {
  const type = String(req.query.type);
  const limit = Number(req.query.limit);
  const tags = req.query.tags as string[] | undefined;
  const result = pets
    .filter((pet) => pet.type === type && (!tags || tags.every((tag) => pet.tags.includes(tag))))
    .slice(0, limit);

  res.json(result);
}

export function createPet(req: Request, res: Response) {
  const newPet = { ...req.body, id: creationId++ };
  pets.push(newPet);
  res.json(newPet);
}

export function findPetById(req: Request, res: Response) {
  const id: number = Number(req.params.id);
  const pet = pets.find((pet) => pet.id === id);
  pet ? res.json(pet) : res.status(404).json({ message: "not found" });
}

export function deletePet(req: Request, res: Response) {
  const id: number = Number(req.params.id);
  pets = pets.filter((pet) => pet.id !== id);
  res.status(204).end();
}
