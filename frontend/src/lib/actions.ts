"use server";

import { revalidatePath } from "next/cache";
import { DisasterList, DisasterDetail } from "./types";

const ITEMS_PER_PAGE = 10; // Adjust this value as needed

export async function getAllDisasters(
  page: number = 1
): Promise<DisasterList[]> {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const response = await fetch(
    `${process.env.API_BASE_URL}/disasters/?skip=${skip}&limit=${ITEMS_PER_PAGE}`,
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
  page: number = 1
): Promise<DisasterList[]> {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const response = await fetch(
    `${process.env.API_BASE_URL}/disasters/filter?status=${status}&skip=${skip}&limit=${ITEMS_PER_PAGE}`,
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
