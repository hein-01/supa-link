import React, { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, startOfDay, endOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { CheckCircle2, XCircle } from "lucide-react";

// Minimal currency formatter – adjust currency if needed
const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

// Types from generated supabase types
type Resource = Pick<Tables<"business_resources">, "id" | "name" | "business_id">;

type SlotRow = Pick<
  Tables<"slots">,
  "id" | "start_time" | "end_time" | "is_booked" | "slot_price" | "resource_id"
>;

export type ServiceAvailabilityProps = {
  initialResourceId?: string; // also read from URL ?resourceId=
  initialDate?: string | Date; // also read from URL ?date=YYYY-MM-DD
};

function toISODateOnly(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function toDisplayHeader(d: Date) {
  // Example: AVAILABLE SCHEDULE (11 NOV 2025)
  return format(d, "d LLL yyyy").toUpperCase();
}

function formatTimeRange(startISO: string, endISO: string) {
  try {
    const s = new Date(startISO);
    const e = new Date(endISO);
    const sStr = format(s, "ha").toLowerCase();
    const eStr = format(e, "ha").toLowerCase();
    return `${sStr.replace("m", "m")} - ${eStr.replace("m", "m")}`; // keep am/pm lowercase like screenshot
  } catch {
    return `${startISO} - ${endISO}`;
  }
}

export default function ServiceAvailability(props: ServiceAvailabilityProps) {
  // From URL if available
  const url = new URL(location.href);
  const urlResourceId = url.searchParams.get("resourceId") || undefined;
  const urlDate = url.searchParams.get("date") || undefined; // YYYY-MM-DD

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (props.initialDate instanceof Date) return props.initialDate;
    if (typeof props.initialDate === "string") return new Date(props.initialDate);
    if (urlDate) return new Date(urlDate);
    return new Date();
  });

  const [initialResourceId] = useState<string | undefined>(
    props.initialResourceId || urlResourceId
  );

  const [resources, setResources] = useState<Array<Pick<Resource, "id" | "name">>>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string | undefined>(
    props.initialResourceId || urlResourceId
  );
  const [selectedResourceName, setSelectedResourceName] = useState<string>("");
  const [loadingResources, setLoadingResources] = useState(false);
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(new Set());

  const total = useMemo(() => {
    const selected = new Set(selectedSlotIds);
    return slots
      .filter((s) => selected.has(s.id))
      .reduce((sum, s) => sum + (s.slot_price || 0), 0);
  }, [selectedSlotIds, slots]);

  // Step 1: fetch initial resource to learn business_id, then all sibling resources
  useEffect(() => {
    async function loadResources() {
      if (!initialResourceId) return;
      setLoadingResources(true);
      setError(null);
      try {
        const { data: initialRes, error: rerr } = await supabase
          .from("business_resources")
          .select("id,name,business_id")
          .eq("id", initialResourceId)
          .maybeSingle();
        if (rerr) throw rerr;
        if (!initialRes) throw new Error("Resource not found");

        // Remember name for table column
        setSelectedResourceName(initialRes.name);

        const { data: siblings, error: serr } = await supabase
          .from("business_resources")
          .select("id,name")
          .eq("business_id", (initialRes as Resource).business_id)
          .order("name", { ascending: true });
        if (serr) throw serr;
        setResources(siblings || []);

        // Ensure selectedResourceId is valid
        setSelectedResourceId((prev) => prev || initialRes.id);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load resources";
        setError(message);
      } finally {
        setLoadingResources(false);
      }
    }
    loadResources();
  }, [initialResourceId]);

  // Step 2: load slots when resource/date changes
  useEffect(() => {
    async function loadSlots() {
      if (!selectedResourceId || !selectedDate) return;
      setLoadingSlots(true);
      setError(null);
      setSelectedSlotIds(new Set()); // reset selections when date/resource changes
      try {
        const start = startOfDay(selectedDate);
        const end = endOfDay(selectedDate);

        const { data, error: serr } = await supabase
          .from("slots")
          .select("id, start_time, end_time, is_booked, slot_price, resource_id")
          .eq("resource_id", selectedResourceId)
          .gte("start_time", start.toISOString())
          .lt("start_time", end.toISOString())
          .order("start_time", { ascending: true });
        if (serr) throw serr;
        setSlots(data || []);

        // Also update selected resource name for the table column
        const r = resources.find((x) => x.id === selectedResourceId);
        if (r) setSelectedResourceName(r.name);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load slots";
        setError(message);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [selectedResourceId, selectedDate, resources]);

  function toggleSelect(slot: SlotRow) {
    if (slot.is_booked) return; // can't select booked slot
    setSelectedSlotIds((prev) => {
      const next = new Set(prev);
      if (next.has(slot.id)) next.delete(slot.id);
      else next.add(slot.id);
      return next;
    });
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Header controls */}
      <div className="max-w-5xl w-full mx-auto p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={selectedResourceId || ""}
              onChange={(e) => setSelectedResourceId(e.target.value)}
              disabled={loadingResources}
            >
              {resources.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">▾</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="border rounded-md p-3">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            showOutsideDays
            weekStartsOn={1}
            styles={{
              caption: { textTransform: "capitalize" },
              day: { borderRadius: 8 },
              head_cell: { fontWeight: 600 },
            }}
          />
        </div>
      </div>

      {/* Schedule table */}
      <div className="max-w-5xl w-full mx-auto p-4 flex-1">
        <h2 className="text-sm font-semibold tracking-wide text-gray-800 mb-2">
          AVAILABLE SCHEDULE ({toDisplayHeader(selectedDate)})
        </h2>

        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="text-left px-4 py-2 font-medium">Time</th>
                <th className="text-left px-4 py-2 font-medium">Price (W/GST)</th>
                <th className="text-left px-4 py-2 font-medium">{selectedResourceName || "Resource"}</th>
              </tr>
            </thead>
            <tbody>
              {loadingSlots && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={3}>Loading schedule…</td>
                </tr>
              )}
              {!loadingSlots && slots.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={3}>No slots found for {toISODateOnly(selectedDate)}</td>
                </tr>
              )}
              {!loadingSlots && slots.map((slot, idx) => {
                const isSelected = selectedSlotIds.has(slot.id);
                const icon = slot.is_booked ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle2 className={`h-5 w-5 ${isSelected ? "text-green-600" : "text-emerald-500"}`} />
                );
                return (
                  <tr
                    key={slot.id}
                    className={`${idx % 2 ? "bg-white" : "bg-gray-50"} ${!slot.is_booked ? "cursor-pointer" : ""} ${isSelected ? "ring-2 ring-green-600" : ""}`}
                    onClick={() => toggleSelect(slot)}
                  >
                    <td className="px-4 py-3">{formatTimeRange(slot.start_time, slot.end_time)}</td>
                    <td className="px-4 py-3">{currency.format(slot.slot_price)}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      {icon}
                      <span>{selectedResourceName || "Resource"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600">{error}</div>
        )}
      </div>

      {/* Sticky footer / checkout */}
      <div className="sticky bottom-0 left-0 right-0 bg-black text-white">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between px-4 py-3">
          <div>
            <div className="text-xs tracking-wide text-gray-300">TOTAL CHARGES</div>
            <div className="text-2xl font-semibold">{currency.format(total)}</div>
          </div>
          <button
            className={`px-4 py-2 rounded-md text-black font-medium ${selectedSlotIds.size > 0 ? "bg-white" : "bg-gray-400 cursor-not-allowed"}`}
            disabled={selectedSlotIds.size === 0}
            onClick={() => {
              // Placeholder booking handler – integrate your booking flow here
              console.log("Booking slots:", Array.from(selectedSlotIds));
            }}
          >
            BOOK NOW
          </button>
        </div>
      </div>
    </div>
  );
}
