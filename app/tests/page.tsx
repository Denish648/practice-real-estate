"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

// ======================================================
// CHANGE ONLY THIS
// ======================================================

const TEST = "private" // "private" or "public"

// ======================================================
// TEST DATA
// ======================================================

const deals = {
  private: {
    dealId: "359ed0b7-ac13-47b7-82ab-acf802620721",
    imagePath:
      "9f6019f5-744d-43a4-a163-ce049893454d/359ed0b7-ac13-47b7-82ab-acf802620721/10fab7e9-53f2-497d-86df-1eb9c222e4e6.jpg",
  },

  public: {
    dealId: "59b9d780-0133-447a-82d4-35cbde9a92f0",
    imagePath:
      "9f6019f5-744d-43a4-a163-ce049893454d/59b9d780-0133-447a-82d4-35cbde9a92f0/9923b4fd-78ab-409c-8eea-34c362f7a85c.jpg",
  },
}

const testDeal = deals[TEST]

export default function TestStorage() {
  const [role, setRole] = useState<string>("Not checked")

  // ======================================================
  // CHECK CURRENT USER
  // ======================================================

  const getUser = async () => {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()

    const userRole = data.user?.user_metadata?.role

    setRole(userRole || "No role")

    console.log("USER:", data.user)
    console.log("ROLE:", userRole)
    console.log("USER ERROR:", error)
  }

  // ======================================================
  // TEST 1: DOWNLOAD IMAGE
  // ======================================================

  const testImageDownload = async () => {
    const supabase = createClient()

    const { data, error } = await supabase.storage
      .from("deal-images")
      .download(testDeal.imagePath)

    console.log("========== IMAGE DOWNLOAD ==========")
    console.log("TEST:", TEST)
    console.log("IMAGE DATA:", data)
    console.log("IMAGE ERROR:", error)
  }

  // ======================================================
  // TEST 2: GENERATE SIGNED URL
  // ======================================================

  const testSignedUrl = async () => {
    const supabase = createClient()

    const { data, error } = await supabase.storage
      .from("deal-images")
      .createSignedUrl(testDeal.imagePath, 60)

    console.log("========== SIGNED URL ==========")
    console.log("TEST:", TEST)
    console.log("SIGNED URL DATA:", data)
    console.log("SIGNED URL ERROR:", error)
  }

  // ======================================================
  // TEST 3: QUERY deal_images TABLE
  // ======================================================

  const testDealImages = async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("deal_images")
      .select("*")
      .eq("deal_id", testDeal.dealId)

    console.log("========== DEAL IMAGES TABLE ==========")
    console.log("TEST:", TEST)
    console.log("IMAGE DATA:", data)
    console.log("IMAGE ERROR:", error)
  }

  return (
    <div>
      <h1>Supabase Security Test</h1>

      <p>
        Current user role: <strong>{role}</strong>
      </p>

      <p>
        Testing: <strong>{TEST}</strong>
      </p>

      <hr />

      <button onClick={getUser}>0. Check Current User</button>

      <br />
      <br />

      <button onClick={testImageDownload}>1. Test Image Download</button>

      <br />
      <br />

      <button onClick={testSignedUrl}>2. Test Signed URL</button>

      <br />
      <br />

      <button onClick={testDealImages}>3. Test deal_images Table</button>
    </div>
  )
}
