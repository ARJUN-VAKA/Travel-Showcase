import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useTrips } from "../context/TripContext";
import type { MediaItem, Trip } from "../context/TripContext";

const ACCENT_COLORS = [
  { label: "Yellow", value: "#FFE500" },
  { label: "Pink", value: "#FF2D55" },
  { label: "Lime", value: "#00FF41" },
  { label: "Blue", value: "#0000FF" },
  { label: "Orange", value: "#FF6B00" },
  { label: "Purple", value: "#9B00FF" },
];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageUploadButton({
  label,
  current,
  onUpload,
  aspectClass = "aspect-video",
}: {
  label: string;
  current: string;
  onUpload: (dataUrl: string) => void;
  aspectClass?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    onUpload(dataUrl);
    e.target.value = "";
  }, [onUpload]);

  return (
    <div>
      <label className="block text-xs font-bold uppercase mb-1 font-mono">{label}</label>
      <div
        className={`relative border-4 border-black ${aspectClass} overflow-hidden bg-muted cursor-pointer group`}
        style={{ boxShadow: "4px 4px 0 black" }}
        onClick={() => inputRef.current?.click()}
        data-testid="image-upload-area"
      >
        {current ? (
          <img src={current} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-bold uppercase text-sm">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white font-black uppercase text-lg">Upload</span>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        data-testid="image-file-input"
      />
      {current && (
        <button
          onClick={() => onUpload("")}
          className="mt-1 text-xs font-bold uppercase border-2 border-black px-2 py-0.5 bg-white hover:bg-destructive hover:text-white transition-colors"
          data-testid="image-remove-btn"
        >
          Remove
        </button>
      )}
    </div>
  );
}

function MediaRow({
  tripId,
  item,
  index,
  total,
}: {
  tripId: string;
  item: MediaItem;
  index: number;
  total: number;
}) {
  const { updateMedia, deleteMedia, reorderMedia } = useTrips();
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    updateMedia(tripId, item.id, { src: dataUrl, type: "photo" });
    e.target.value = "";
  }, [tripId, item.id, updateMedia]);

  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    updateMedia(tripId, item.id, { src: dataUrl, type: "video" });
    e.target.value = "";
  }, [tripId, item.id, updateMedia]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border-4 border-black p-4 bg-white"
      style={{ boxShadow: "4px 4px 0 black" }}
      data-testid={`media-row-${item.id}`}
    >
      <div className="flex gap-4 flex-wrap items-start">

        {/* Thumbnail */}
        <div className="w-24 h-24 border-2 border-black overflow-hidden bg-muted flex-shrink-0 relative">
          {item.src ? (
            item.type === "video" ? (
              <video src={item.src} className="w-full h-full object-cover" />
            ) : (
              <img src={item.src} alt={item.caption} className="w-full h-full object-cover" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-mono text-muted-foreground uppercase">None</div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-black text-white text-center text-xs font-mono py-0.5 uppercase">
            {item.type}
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 grid grid-cols-1 gap-2 min-w-[200px]">
          <div>
            <label className="text-xs font-bold uppercase font-mono block mb-0.5">Caption</label>
            <input
              className="w-full border-2 border-black px-2 py-1 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
              value={item.caption}
              onChange={e => updateMedia(tripId, item.id, { caption: e.target.value })}
              data-testid={`media-caption-${item.id}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold uppercase font-mono block mb-0.5">Timestamp</label>
              <input
                className="w-full border-2 border-black px-2 py-1 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                value={item.timestamp}
                onChange={e => updateMedia(tripId, item.id, { timestamp: e.target.value })}
                data-testid={`media-timestamp-${item.id}`}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase font-mono block mb-0.5">Orientation</label>
              <select
                className="w-full border-2 border-black px-2 py-1 font-mono text-sm bg-white focus:outline-none"
                value={item.orientation}
                onChange={e => updateMedia(tripId, item.id, { orientation: e.target.value as MediaItem["orientation"] })}
                data-testid={`media-orientation-${item.id}`}
              >
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
              </select>
            </div>
          </div>

          {/* Media source */}
          <div>
            <label className="text-xs font-bold uppercase font-mono block mb-0.5">Media Source</label>
            <div className="flex gap-2 flex-wrap">
              <label className="border-2 border-black px-3 py-1 text-xs font-bold uppercase cursor-pointer bg-primary hover:bg-black hover:text-white transition-colors">
                Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <label className="border-2 border-black px-3 py-1 text-xs font-bold uppercase cursor-pointer bg-accent hover:bg-black hover:text-white transition-colors">
                Upload Video
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoUpload}
                />
              </label>
              <button
                onClick={() => {
                  const url = prompt("Paste a video URL:");
                  if (url) updateMedia(tripId, item.id, { src: url, type: "video" });
                }}
                className="border-2 border-black px-3 py-1 text-xs font-bold uppercase bg-white hover:bg-secondary hover:text-white transition-colors"
                data-testid={`media-url-btn-${item.id}`}
              >
                Video URL
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={() => reorderMedia(tripId, index, Math.max(0, index - 1))}
            disabled={index === 0}
            className="border-2 border-black px-3 py-1 text-xs font-black disabled:opacity-30 hover:bg-black hover:text-white transition-colors"
            data-testid={`media-up-${item.id}`}
          >
            UP
          </button>
          <button
            onClick={() => reorderMedia(tripId, index, Math.min(total - 1, index + 1))}
            disabled={index === total - 1}
            className="border-2 border-black px-3 py-1 text-xs font-black disabled:opacity-30 hover:bg-black hover:text-white transition-colors"
            data-testid={`media-down-${item.id}`}
          >
            DN
          </button>
          <button
            onClick={() => { if (confirm("Delete this media item?")) deleteMedia(tripId, item.id); }}
            className="border-2 border-black px-3 py-1 text-xs font-black bg-destructive text-white hover:opacity-80 transition-opacity"
            data-testid={`media-delete-${item.id}`}
          >
            DEL
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function TripEditor({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const { updateTrip, deleteTrip, addMedia } = useTrips();

  const handleAddMedia = useCallback(() => {
    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      type: "photo",
      src: "",
      caption: "New memory",
      orientation: "landscape",
      timestamp: "Day 1",
    };
    addMedia(trip.id, newItem);
  }, [trip.id, addMedia]);

  const handleDelete = useCallback(() => {
    if (confirm(`Delete "${trip.place}" and all its memories? This cannot be undone.`)) {
      deleteTrip(trip.id);
      onClose();
    }
  }, [trip.id, trip.place, deleteTrip, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex-1 overflow-y-auto p-6 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-4xl font-black uppercase" style={{ fontFamily: "var(--app-font-display)" }}>
            {trip.place}
          </h2>
          <p className="font-mono text-sm text-muted-foreground">Editing trip details</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/trip/${trip.id}`}
            className="border-4 border-black px-4 py-2 font-bold uppercase text-sm bg-primary hover:bg-black hover:text-white transition-colors"
            style={{ boxShadow: "3px 3px 0 black" }}
            data-testid="preview-trip-btn"
          >
            Preview
          </Link>
          <button
            onClick={handleDelete}
            className="border-4 border-black px-4 py-2 font-bold uppercase text-sm bg-destructive text-white hover:opacity-80"
            style={{ boxShadow: "3px 3px 0 black" }}
            data-testid="delete-trip-btn"
          >
            Delete Trip
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <section className="border-4 border-black p-6 bg-white" style={{ boxShadow: "6px 6px 0 black" }}>
        <h3 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2" style={{ fontFamily: "var(--app-font-display)" }}>
          Basic Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-1 font-mono">Place Name</label>
            <input
              className="w-full border-4 border-black px-3 py-2 text-lg font-black uppercase bg-white focus:outline-none focus:ring-2 focus:ring-black"
              value={trip.place}
              onChange={e => updateTrip(trip.id, { place: e.target.value.toUpperCase() })}
              data-testid="input-place-name"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1 font-mono">Tagline</label>
            <input
              className="w-full border-4 border-black px-3 py-2 font-bold uppercase bg-white focus:outline-none focus:ring-2 focus:ring-black"
              value={trip.tagline}
              onChange={e => updateTrip(trip.id, { tagline: e.target.value.toUpperCase() })}
              data-testid="input-tagline"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1 font-mono">Date</label>
            <input
              className="w-full border-4 border-black px-3 py-2 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-black"
              value={trip.date}
              onChange={e => updateTrip(trip.id, { date: e.target.value })}
              data-testid="input-date"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1 font-mono">Friends Count</label>
            <input
              type="number"
              min={1}
              max={100}
              className="w-full border-4 border-black px-3 py-2 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-black"
              value={trip.friendCount}
              onChange={e => updateTrip(trip.id, { friendCount: parseInt(e.target.value) || 1 })}
              data-testid="input-friend-count"
            />
          </div>
        </div>

        {/* Color picker */}
        <div className="mt-4">
          <label className="block text-xs font-bold uppercase mb-2 font-mono">Tag Color</label>
          <div className="flex gap-2 flex-wrap">
            {ACCENT_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => updateTrip(trip.id, { color: c.value })}
                className="w-10 h-10 border-4 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c.value,
                  borderColor: trip.color === c.value ? "black" : "transparent",
                  boxShadow: trip.color === c.value ? "3px 3px 0 black" : "none",
                  transform: trip.color === c.value ? "scale(1.1)" : undefined,
                }}
                title={c.label}
                data-testid={`color-btn-${c.label.toLowerCase()}`}
              />
            ))}
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={trip.color}
                onChange={e => updateTrip(trip.id, { color: e.target.value })}
                className="w-10 h-10 border-4 border-black cursor-pointer"
                title="Custom color"
                data-testid="color-custom"
              />
              <span className="text-xs font-mono uppercase">Custom</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cover Image */}
      <section className="border-4 border-black p-6 bg-white" style={{ boxShadow: "6px 6px 0 black" }}>
        <h3 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2" style={{ fontFamily: "var(--app-font-display)" }}>
          Cover Image
        </h3>
        <div className="max-w-sm">
          <ImageUploadButton
            label="Card Cover Photo"
            current={trip.coverImage}
            onUpload={dataUrl => updateTrip(trip.id, { coverImage: dataUrl })}
            aspectClass="aspect-[4/3]"
          />
        </div>
      </section>

      {/* Media Items */}
      <section className="border-4 border-black p-6 bg-white" style={{ boxShadow: "6px 6px 0 black" }}>
        <div className="flex items-center justify-between mb-4 border-b-4 border-black pb-2">
          <h3 className="text-xl font-black uppercase" style={{ fontFamily: "var(--app-font-display)" }}>
            Story Media ({trip.media.length})
          </h3>
          <button
            onClick={handleAddMedia}
            className="border-4 border-black px-4 py-2 font-bold uppercase text-sm bg-accent hover:bg-black hover:text-white transition-colors"
            style={{ boxShadow: "3px 3px 0 black" }}
            data-testid="add-media-btn"
          >
            + Add Item
          </button>
        </div>

        {trip.media.length === 0 ? (
          <div className="border-4 border-dashed border-black p-12 text-center">
            <p className="font-black uppercase text-muted-foreground text-lg">No media yet.</p>
            <p className="font-mono text-sm text-muted-foreground mt-1">Click "+ Add Item" to start building the story.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {trip.media.map((item, index) => (
                <MediaRow
                  key={item.id}
                  tripId={trip.id}
                  item={item}
                  index={index}
                  total={trip.media.length}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </motion.div>
  );
}

export default function Dashboard() {
  const { trips, addTrip, resetToDefaults, exportData, importData } = useTrips();
  const [selectedId, setSelectedId] = useState<string | null>(trips[0]?.id ?? null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const selectedTrip = trips.find(t => t.id === selectedId) ?? null;

  const handleAddTrip = useCallback(() => {
    const id = addTrip() as unknown as string;
    setSelectedId(id);
  }, [addTrip]);

  const handleReset = useCallback(() => {
    if (confirm("Reset everything to the original sample trips? All your changes will be lost.")) {
      resetToDefaults();
      setSelectedId(trips[0]?.id ?? null);
    }
  }, [resetToDefaults, trips]);

  const handleImportFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const error = importData(text);
    if (error) {
      setImportError(error);
      setImportSuccess(null);
    } else {
      setImportError(null);
      setImportSuccess(`✓ "${file.name}" imported successfully — data saved to database and will appear on all devices.`);
      setSelectedId(null);
      setTimeout(() => setImportSuccess(null), 6000);
    }
    e.target.value = "";
  }, [importData]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b-4 border-black bg-primary px-6 py-4 flex items-center justify-between flex-wrap gap-3 flex-shrink-0"
        style={{ boxShadow: "0 4px 0 black" }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="border-4 border-black px-4 py-2 font-bold uppercase text-sm bg-white hover:bg-black hover:text-white transition-colors"
            style={{ boxShadow: "3px 3px 0 black" }}
            data-testid="nav-home"
          >
            View Portfolio
          </Link>
          <h1 className="text-3xl font-black uppercase" style={{ fontFamily: "var(--app-font-display)" }}>
            Dashboard
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleAddTrip}
            className="border-4 border-black px-4 py-2 font-bold uppercase text-sm bg-accent hover:bg-black hover:text-white transition-colors"
            style={{ boxShadow: "3px 3px 0 black" }}
            data-testid="add-trip-btn"
          >
            + New Trip
          </button>
          <button
            onClick={exportData}
            className="border-4 border-black px-4 py-2 font-bold uppercase text-sm bg-white hover:bg-black hover:text-white transition-colors"
            style={{ boxShadow: "3px 3px 0 black" }}
            data-testid="export-btn"
          >
            Export
          </button>
          <label
            className="border-4 border-black px-4 py-2 font-bold uppercase text-sm bg-white hover:bg-black hover:text-white transition-colors cursor-pointer"
            style={{ boxShadow: "3px 3px 0 black" }}
            data-testid="import-label"
          >
            Import
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportFile}
              data-testid="import-input"
            />
          </label>
          <button
            onClick={handleReset}
            className="border-4 border-black px-4 py-2 font-bold uppercase text-sm bg-white hover:bg-black hover:text-white transition-colors"
            style={{ boxShadow: "3px 3px 0 black" }}
            data-testid="reset-btn"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Import error banner */}
      <AnimatePresence>
        {importError && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b-4 border-black bg-destructive text-white px-6 py-3 flex items-center justify-between font-mono text-sm overflow-hidden"
          >
            <span>{importError}</span>
            <button onClick={() => setImportError(null)} className="font-black ml-4 hover:opacity-70">X</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import success banner */}
      <AnimatePresence>
        {importSuccess && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b-4 border-black px-6 py-3 flex items-center justify-between font-mono text-sm overflow-hidden"
            style={{ backgroundColor: "#00C851", color: "white" }}
          >
            <span>{importSuccess}</span>
            <button onClick={() => setImportSuccess(null)} className="font-black ml-4 hover:opacity-70">X</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r-4 border-black bg-white overflow-y-auto flex-shrink-0">
          <div className="p-3 border-b-2 border-dashed border-black">
            <p className="text-xs font-bold uppercase font-mono text-muted-foreground">
              {trips.length} Trip{trips.length !== 1 ? "s" : ""}
            </p>
          </div>
          <nav>
            {trips.map(trip => (
              <button
                key={trip.id}
                onClick={() => setSelectedId(trip.id)}
                className={`w-full text-left px-4 py-4 border-b-2 border-black flex items-center gap-3 transition-colors ${
                  selectedId === trip.id
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-muted"
                }`}
                data-testid={`sidebar-trip-${trip.id}`}
              >
                {/* Color swatch */}
                <div
                  className="w-4 h-4 border-2 flex-shrink-0"
                  style={{
                    backgroundColor: trip.color,
                    borderColor: selectedId === trip.id ? "white" : "black",
                  }}
                />
                <div className="min-w-0">
                  <div className="font-black uppercase text-sm truncate" style={{ fontFamily: "var(--app-font-display)" }}>
                    {trip.place}
                  </div>
                  <div className={`text-xs font-mono truncate ${selectedId === trip.id ? "text-white/70" : "text-muted-foreground"}`}>
                    {trip.date} · {trip.media.length} items
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Editor pane */}
        <AnimatePresence mode="wait">
          {selectedTrip ? (
            <TripEditor
              key={selectedTrip.id}
              trip={selectedTrip}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center text-center p-12"
            >
              <div className="border-4 border-dashed border-black p-12 max-w-md">
                <h2 className="text-3xl font-black uppercase mb-4" style={{ fontFamily: "var(--app-font-display)" }}>
                  Select a trip
                </h2>
                <p className="font-mono text-muted-foreground">
                  Pick a trip from the sidebar to edit its details, or create a new one.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
