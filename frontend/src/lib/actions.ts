"use server";

import { revalidatePath } from "next/cache";
import { DisasterList, DisasterDetail } from "./types";

export async function getAllDisasters(
  skip: number = 0,
  limit: number = 100
): Promise<DisasterList[]> {
  const response = await fetch(
    `${process.env.API_BASE_URL}/disasters/?skip=${skip}&limit=${limit}`,
    {
      method: "GET",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch disasters");
  }

  const disasters = await response.json();
  revalidatePath("/");
  return disasters;
}

export async function filterDisasters(
  status: "alert" | "ongoing",
  skip: number = 0,
  limit: number = 100
): Promise<DisasterList[]> {
  const response = await fetch(
    `${process.env.API_BASE_URL}/disasters/filter?status=${status}&skip=${skip}&limit=${limit}`,
    {
      method: "GET",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to filter disasters");
  }

  const disasters = await response.json();
  revalidatePath(`/${status}`);
  return disasters;
}

export async function getDisasterDetail(
  disasterId: number
): Promise<DisasterDetail> {
  const response = await fetch(
    `${process.env.API_BASE_URL}/disasters/${disasterId}`,
    {
      method: "GET",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch disaster details");
  }

  const disaster = await response.json();
  revalidatePath(`/disasters/${disasterId}`);
  return disaster;
}
