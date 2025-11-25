import { adminClient } from "@/lib/sanity/client";

export async function POST(req: Request) {
  const { workoutId }: { workoutId: string } = await req.json();

  if (!workoutId) {
    return new Response("Missing workoutId", { status: 400 });
  }

  try {
    await adminClient.delete(workoutId as string);
    console.log("Workout deleted:", workoutId);
    return Response.json({ message: "Workout deleted" });
  } catch (error) {
    console.error("Error deleting workout:", error);
    return new Response("Error deleting workout", { status: 500 });
  }
}
