import { useState, useEffect, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import {
  DndContext, closestCenter,
  PointerSensor, useSensor, useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, rectSortingStrategy,
} from "@dnd-kit/sortable";

import api             from "../api/client";
import SortableGoalCard from "../components/SortableGoalCard";
import GoalCard        from "../components/GoalCard";
import GoalModal       from "../components/GoalModal";
import DepositModal    from "../components/DepositModal";

const CATEGORIES = [
  "All","Emergency Fund","Vacation","Home","Car","Education",
  "Retirement","Wedding","Tech","Health","Other",
];
const STATUS_OPTS = [
  { value: "",          label: "All Goals"  },
  { value: "active",    label: "Active"     },
  { value: "completed", label: "Completed"  },
];
const SORT_OPTS = [
  { value: "custom",     label: "Custom order"  },
  { value: "created_at", label: "Newest first"  },
  { value: "progress",   label: "Most progress" },
  { value: "deadline",   label: "Deadline"      },
];

export default function Goals() {
  const [goals,     setGoals]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("All");
  const [status,    setStatus]    = useState("");
  const [sort,      setSort]      = useState("custom");
  const [activeId,  setActiveId]  = useState(null);   // for DragOverlay
  const [goalModal, setGoalModal] = useState(false);
  const [editGoal,  setEditGoal]  = useState(null);
  const [depGoal,   setDepGoal]   = useState(null);

  // Require 8 px of movement before drag starts — prevents mis-fires on button clicks
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (category !== "All") params.append("category", category);
      if (status)             params.append("status",   status);
      const r = await api.get(`/goals?${params}`);
      setGoals(r.data);
    } finally {
      setLoading(false);
    }
  }, [category, status, sort]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  // Client-side search filter
  const filtered = goals.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description?.toLowerCase().includes(search.toLowerCase())
  );

  // ── DnD handlers ─────────────────────────────────────────────────────────
  function handleDragStart({ active }) {
    setActiveId(active.id);
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIdx  = goals.findIndex(g => g.id === active.id);
    const newIdx  = goals.findIndex(g => g.id === over.id);
    const reordered = arrayMove(goals, oldIdx, newIdx);
    setGoals(reordered);

    // Persist new sort_order to backend (optimistic update already done above)
    api.patch("/goals/reorder", reordered.map((g, i) => ({ id: g.id, sort_order: i })))
      .catch(() => fetchGoals()); // revert on error
  }

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  async function handleCreate(data) {
    await api.post("/goals", data);
    fetchGoals();
  }
  async function handleEdit(data) {
    await api.put(`/goals/${editGoal.id}`, data);
    fetchGoals();
  }
  async function handleDelete(goal) {
    if (!confirm(`Delete "${goal.name}"? All deposits will be lost.`)) return;
    await api.delete(`/goals/${goal.id}`);
    fetchGoals();
  }
  async function handleDeposit(data) {
    await api.post(`/goals/${depGoal.id}/deposits`, data);
    fetchGoals();
  }
  async function handleToggleComplete(goal) {
    await api.put(`/goals/${goal.id}`, { is_completed: !goal.is_completed });
    fetchGoals();
  }

  const activeGoal = activeId ? goals.find(g => g.id === activeId) : null;
  const isDraggable = sort === "custom" && !search && !category.replace("All","") && !status;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="page-subtitle">{goals.length} goal{goals.length !== 1 ? "s" : ""} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setGoalModal(true)}>
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <Search size={15} style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
        <input
          className="form-control"
          style={{ paddingLeft: "2.2rem" }}
          placeholder="Search goals…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {STATUS_OPTS.map(o => (
          <button
            key={o.value}
            className={`filter-chip${status === o.value ? " active" : ""}`}
            onClick={() => setStatus(o.value)}
          >{o.label}</button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Drag hint */}
      {isDraggable && filtered.length > 1 && (
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.9rem" }}>
          ⠿ Drag the grip handle on any card to reorder
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No goals found</h3>
          <p>Try adjusting your filters or create a new goal.</p>
          <button className="btn btn-primary" onClick={() => setGoalModal(true)}>
            <Plus size={16} /> New Goal
          </button>
        </div>
      ) : isDraggable ? (
        // ── Sortable grid (custom order only) ───────────────────────────────
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={filtered.map(g => g.id)} strategy={rectSortingStrategy}>
            <div className="goals-grid">
              {filtered.map(goal => (
                <SortableGoalCard
                  key={goal.id}
                  goal={goal}
                  onDeposit={setDepGoal}
                  onEdit={setEditGoal}
                  onDelete={handleDelete}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          </SortableContext>

          {/* Ghost card shown under the cursor while dragging */}
          <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
            {activeGoal && (
              <div style={{ opacity: 0.9, pointerEvents: "none" }}>
                <GoalCard
                  goal={activeGoal}
                  onDeposit={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onToggleComplete={() => {}}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        // ── Regular (sorted) grid ────────────────────────────────────────────
        <div className="goals-grid">
          {filtered.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDeposit={setDepGoal}
              onEdit={setEditGoal}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}

      {goalModal && <GoalModal onClose={() => setGoalModal(false)} onSave={handleCreate} />}
      {editGoal  && <GoalModal goal={editGoal} onClose={() => setEditGoal(null)} onSave={handleEdit} />}
      {depGoal   && <DepositModal goal={depGoal} onClose={() => setDepGoal(null)} onSave={handleDeposit} />}
    </div>
  );
}
