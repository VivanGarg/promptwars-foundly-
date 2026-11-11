
import { useMemo, useState } from "react";
import {
  Search, Plus, LayoutDashboard, PackageSearch, PackageCheck,
  ClipboardList, Bell, MapPin, CalendarDays, ArrowUpRight,
  X, Camera, CheckCircle2, Clock3, ShieldCheck, Sparkles,
  Menu, Filter, ChevronDown, AlertCircle, Handshake,
} from "lucide-react";
import "./App.css";

const initialItems = [
  { id: 1, title: "Black wallet", category: "Accessories", type: "Lost", location: "Library - 2nd Floor", date: "2026-11-10", description: "A black leather wallet with a few cards and my college ID. Possibly left near the study tables.", reporter: "Aarav", status: "Open", image: "", tags: ["wallet", "black", "leather"] },
  { id: 2, title: "AirPods case", category: "Electronics", type: "Found", location: "Cafeteria", date: "2026-11-10", description: "White wireless earbud charging case found on a table near the entrance.", reporter: "Riya", status: "Open", image: "", tags: ["airpods", "white", "case"] },
  { id: 3, title: "Student ID card", category: "ID & Documents", type: "Found", location: "Academic Block A", date: "2026-11-09", description: "Found a student identity card outside the main lecture hall.", reporter: "Kabir", status: "Open", image: "", tags: ["id", "card", "student"] },
  { id: 4, title: "Blue water bottle", category: "Personal Items", type: "Lost", location: "Sports Complex", date: "2026-11-08", description: "Blue insulated bottle with a small sticker on the side.", reporter: "Meera", status: "Open", image: "", tags: ["blue", "bottle"] },
  { id: 5, title: "USB-C charger", category: "Electronics", type: "Found", location: "Computer Lab 3", date: "2026-11-08", description: "A USB-C laptop charger left plugged in near the back row.", reporter: "Dev", status: "Open", image: "", tags: ["charger", "usb-c"] },
  { id: 6, title: "Set of keys", category: "Keys", type: "Lost", location: "Hostel Block C", date: "2026-11-07", description: "Three keys on a small metal keychain. Might have been dropped near the hostel entrance.", reporter: "Ishita", status: "Open", image: "", tags: ["keys", "keychain"] },
];

const categories = ["Electronics", "Accessories", "ID & Documents", "Keys", "Personal Items", "Books & Stationery", "Other"];
const locations = ["Library", "Cafeteria", "Academic Block A", "Academic Block B", "Sports Complex", "Computer Lab 3", "Hostel Block C", "Main Gate", "Other"];

const navItems = [
  { id: "Overview", icon: LayoutDashboard },
  { id: "Lost Items", icon: PackageSearch },
  { id: "Found Items", icon: PackageCheck },
  { id: "My Reports", icon: ClipboardList },
];

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
  });
}

function getMatchScore(a, b) {
  const textA = `${a.title} ${a.description} ${(a.tags || []).join(" ")}`.toLowerCase();
  const textB = `${b.title} ${b.description} ${(b.tags || []).join(" ")}`.toLowerCase();
  const wordsA = new Set(textA.split(/[^a-z0-9-]+/).filter((w) => w.length > 2));
  const wordsB = new Set(textB.split(/[^a-z0-9-]+/).filter((w) => w.length > 2));
  let overlap = 0;
  wordsA.forEach((word) => { if (wordsB.has(word)) overlap++; });
  let score = Math.min(65, overlap * 18);
  if (a.category === b.category) score += 20;
  if (a.location.toLowerCase().split(" ")[0] === b.location.toLowerCase().split(" ")[0]) score += 15;
  return Math.min(score, 99);
}

function App() {
  const [items, setItems] = useState(initialItems);
  const [activePage, setActivePage] = useState("Overview");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [modal, setModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [form, setForm] = useState({
    type: "Lost", title: "", category: "Electronics", location: "Library",
    date: new Date().toISOString().slice(0, 10), description: "", image: "",
  });
  const [claimText, setClaimText] = useState("");

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const myReports = items.filter((item) => item.reporter === "You");
  const lostCount = items.filter((item) => item.type === "Lost" && item.status === "Open").length;
  const foundCount = items.filter((item) => item.type === "Found" && item.status === "Open").length;
  const resolvedCount = items.filter((item) => item.status === "Resolved").length;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const pageMatch =
        activePage === "Lost Items" ? item.type === "Lost" :
        activePage === "Found Items" ? item.type === "Found" :
        activePage === "My Reports" ? item.reporter === "You" :
        true;
      const searchMatch = `${item.title} ${item.description} ${item.location} ${item.category}`.toLowerCase().includes(search.toLowerCase());
      const categoryMatch = categoryFilter === "All categories" || item.category === categoryFilter;
      const locationMatch = locationFilter === "All locations" || item.location.toLowerCase().includes(locationFilter.toLowerCase());
      return pageMatch && searchMatch && categoryMatch && locationMatch;
    });
  }, [items, activePage, search, categoryFilter, locationFilter]);

  const matches = useMemo(() => {
    const lost = items.filter((item) => item.type === "Lost" && item.status === "Open");
    const found = items.filter((item) => item.type === "Found" && item.status === "Open");
    return lost.flatMap((a) => found.map((b) => ({ lost: a, found: b, score: getMatchScore(a, b) })))
      .filter((pair) => pair.score >= 25)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [items]);

  const openReport = (type = "Lost") => {
    setForm({
      type, title: "", category: "Electronics", location: "Library",
      date: new Date().toISOString().slice(0, 10), description: "", image: "",
    });
    setModal("report");
  };

  const submitReport = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    const newItem = {
      ...form, id: Date.now(), reporter: "You", status: "Open",
      tags: form.title.toLowerCase().split(/\s+/),
    };
    setItems((prev) => [newItem, ...prev]);
    setModal(null);
    setActivePage("My Reports");
    setSearch("");
    setCategoryFilter("All categories");
    setLocationFilter("All locations");
    notify(`${form.type} item reported successfully!`);
  };

  const submitClaim = (e) => {
    e.preventDefault();
    if (!claimText.trim()) return;
    setModal(null);
    setClaimText("");
    notify("Claim submitted! The reporter can now verify your details.");
  };

  const resolveItem = (item) => {
    setItems((prev) => prev.map((x) => x.id === item.id ? { ...x, status: "Resolved" } : x));
    setSelectedItem(null);
    setModal(null);
    notify("Report marked as resolved.");
  };

  const ItemCard = ({ item }) => (
    <article className="item-card">
      <div className={`item-visual ${item.type === "Lost" ? "lost-visual" : "found-visual"}`}>
        {item.image ? <img src={item.image} alt={item.title} /> : (
          <div className="visual-placeholder">
            {item.type === "Lost" ? <PackageSearch size={35} /> : <PackageCheck size={35} />}
            <span>{item.category}</span>
          </div>
        )}
        <span className={`type-pill ${item.type.toLowerCase()}`}>{item.type}</span>
        {item.status === "Resolved" && <span className="resolved-pill">Resolved</span>}
      </div>
      <div className="item-content">
        <div className="item-heading">
          <h3>{item.title}</h3>
          <button className="icon-button small" onClick={() => { setSelectedItem(item); setModal("details"); }} aria-label="View item">
            <ArrowUpRight size={17} />
          </button>
        </div>
        <p className="item-description">{item.description}</p>
        <div className="item-meta"><MapPin size={14} />{item.location}</div>
        <div className="item-meta"><CalendarDays size={14} />{formatDate(item.date)} <span className="meta-dot">·</span> Reported by {item.reporter}</div>
        <button className="card-action" onClick={() => { setSelectedItem(item); setModal("details"); }}>
          View details <ArrowUpRight size={15} />
        </button>
      </div>
    </article>
  );

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><PackageSearch size={23} /></div>
          <div><strong>foundly<span>.</span></strong><small>Campus lost & found</small></div>
          <button className="mobile-close icon-button" onClick={() => setMobileNav(false)}><X size={18} /></button>
        </div>

        <div className="campus-label">WORKSPACE</div>
        <nav className="side-nav">
          {navItems.map(({ id, icon: Icon }) => (
            <button key={id} className={`nav-link ${activePage === id ? "active" : ""}`} onClick={() => { setActivePage(id); setMobileNav(false); }}>
              <Icon size={19} /><span>{id}</span>
              {id === "Lost Items" && <span className="nav-count">{lostCount}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><ShieldCheck size={18} /></div>
            <strong>Safe handovers</strong>
            <p>Always verify ownership before returning an item.</p>
          </div>
          <div className="profile">
            <div className="avatar">Y</div>
            <div><strong>Your workspace</strong><small>Student account</small></div>
            <ChevronDown size={16} />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMobileNav(true)}><Menu size={21} /></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{activePage}</strong></div>
          <div className="topbar-right">
            <span className="campus-status"><span className="status-dot" /> Campus community</span>
            <button className="icon-button notification-button" onClick={() => notify("You're all caught up!")}>
              <Bell size={19} /><i />
            </button>
            <div className="top-avatar">Y</div>
          </div>
        </header>

        <div className="page-content">
          {activePage === "Overview" ? (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow"><Sparkles size={14} /> YOUR CAMPUS, CONNECTED</div>
                  <h1>Find what matters.<br /><span>Return what’s lost.</span></h1>
                  <p className="welcome-subtitle">One place to report, discover, and reunite lost belongings across campus.</p>
                </div>
                <button className="primary-button" onClick={() => openReport("Lost")}><Plus size={18} /> Report an item</button>
              </section>

              <section className="stats-grid">
                <div className="stat-card"><div className="stat-top"><span>Open lost reports</span><div className="stat-icon coral"><PackageSearch size={18} /></div></div><strong>{lostCount}</strong><small>Waiting to be found</small></div>
                <div className="stat-card"><div className="stat-top"><span>Found on campus</span><div className="stat-icon green"><PackageCheck size={18} /></div></div><strong>{foundCount}</strong><small>Ready to be claimed</small></div>
                <div className="stat-card"><div className="stat-top"><span>Reunited items</span><div className="stat-icon blue"><Handshake size={18} /></div></div><strong>{resolvedCount}</strong><small>Marked as resolved</small></div>
                <div className="stat-card"><div className="stat-top"><span>Your reports</span><div className="stat-icon violet"><ClipboardList size={18} /></div></div><strong>{myReports.length}</strong><small>Items you've reported</small></div>
              </section>

              <section className="quick-actions">
                <button className="quick-action lost-quick" onClick={() => openReport("Lost")}><div><PackageSearch size={21} /></div><span><strong>I lost something</strong><small>Report an item you can't find</small></span><ArrowUpRight size={18} /></button>
                <button className="quick-action found-quick" onClick={() => openReport("Found")}><div><PackageCheck size={21} /></div><span><strong>I found something</strong><small>Help return it to its owner</small></span><ArrowUpRight size={18} /></button>
              </section>

              <section className="content-section">
                <div className="section-heading"><div><h2>Potential matches</h2><p>Reports that might belong together</p></div><span className="demo-tag"><Sparkles size={13} /> Smart suggestions</span></div>
                {matches.length ? <div className="matches-list">
                  {matches.map((pair, index) => (
                    <div className="match-row" key={`${pair.lost.id}-${pair.found.id}`}>
                      <div className="match-icon"><Handshake size={19} /></div>
                      <div className="match-copy"><strong>{pair.lost.title} <span>↔</span> {pair.found.title}</strong><small>Lost: {pair.lost.location} · Found: {pair.found.location}</small></div>
                      <div className="match-score"><strong>{pair.score}%</strong><small>similarity</small></div>
                      <button className="icon-button small" onClick={() => { setSelectedItem(pair.found); setModal("details"); }}><ArrowUpRight size={17} /></button>
                    </div>
                  ))}
                </div> : <div className="empty-state compact"><Sparkles size={22} /><strong>No potential matches yet</strong><p>New reports will appear here when similar items are reported.</p></div>}
                <p className="fine-print"><AlertCircle size={13} /> Demo matching uses text, category and location similarity. It is not an AI model yet.</p>
              </section>

              <section className="content-section">
                <div className="section-heading"><div><h2>Recently reported</h2><p>The latest activity from your campus</p></div><button className="text-button" onClick={() => setActivePage("Lost Items")}>Explore reports <ArrowUpRight size={15} /></button></div>
                <div className="items-grid">{items.slice(0, 3).map((item) => <ItemCard key={item.id} item={item} />)}</div>
              </section>
            </>
          ) : (
            <>
              <section className="listing-header">
                <div>
                  <div className="eyebrow"><PackageSearch size={14} /> CAMPUS DIRECTORY</div>
                  <h1>{activePage}</h1>
                  <p className="welcome-subtitle">
                    {activePage === "Lost Items" ? "Help someone find what they've misplaced." :
                     activePage === "Found Items" ? "Browse items waiting to be reunited with their owners." :
                     "Keep track of the items you've reported."}
                  </p>
                </div>
                <button className="primary-button" onClick={() => openReport(activePage === "Found Items" ? "Found" : "Lost")}><Plus size={18} /> New report</button>
              </section>
              <section className="filter-bar">
                <div className="search-box"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items, places, keywords..." /></div>
                <div className="filter-select"><Filter size={16} /><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option>All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>
                <div className="filter-select"><MapPin size={16} /><select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}><option>All locations</option>{locations.map((l) => <option key={l}>{l}</option>)}</select></div>
              </section>
              <div className="results-line"><span>{filteredItems.length} report{filteredItems.length !== 1 ? "s" : ""} found</span><span>Newest first</span></div>
              {filteredItems.length ? <div className="items-grid">{filteredItems.map((item) => <ItemCard key={item.id} item={item} />)}</div> :
                <div className="empty-state"><PackageSearch size={34} /><strong>No reports found</strong><p>Try changing your search or filters, or create a new report.</p><button className="primary-button" onClick={() => openReport("Lost")}><Plus size={17} /> Create a report</button></div>}
            </>
          )}

          <footer className="footer"><span>foundly<span className="brand-period">.</span> Built for a better campus.</span><span>Made with care <span className="heart">♥</span></span></footer>
        </div>
      </main>

      {modal === "report" && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal-panel">
            <div className="modal-header"><div><span className="eyebrow">CAMPUS REPORT</span><h2>Report an item</h2><p>Give the community enough detail to help.</p></div><button className="icon-button" onClick={() => setModal(null)}><X size={20} /></button></div>
            <form onSubmit={submitReport} className="report-form">
              <label>What happened?</label>
              <div className="type-toggle"><button type="button" className={form.type === "Lost" ? "selected lost-selected" : ""} onClick={() => setForm({ ...form, type: "Lost" })}><PackageSearch size={17} /> I lost it</button><button type="button" className={form.type === "Found" ? "selected found-selected" : ""} onClick={() => setForm({ ...form, type: "Found" })}><PackageCheck size={17} /> I found it</button></div>
              <label>Item name</label><input required placeholder="e.g. Black leather wallet" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <div className="form-two-col"><div><label>Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select></div><div><label>Location</label><select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>{locations.map((l) => <option key={l}>{l}</option>)}</select></div></div>
              <label>Date</label><input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <label>Description</label><textarea required rows="3" placeholder="Describe the item, its appearance, or where you last saw it..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <label>Image URL <span className="optional">(optional)</span></label><input placeholder="https://..." value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              <div className="form-note"><ShieldCheck size={16} /> Avoid sharing sensitive personal information publicly.</div>
              <button className="primary-button submit-button" type="submit"><Plus size={17} /> Publish report</button>
            </form>
          </div>
        </div>
      )}

      {modal === "details" && selectedItem && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal-panel details-panel">
            <div className="modal-header"><div><span className="eyebrow">ITEM DETAILS</span><h2>{selectedItem.title}</h2><p>Reported by {selectedItem.reporter}</p></div><button className="icon-button" onClick={() => setModal(null)}><X size={20} /></button></div>
            <div className={`detail-visual ${selectedItem.type === "Lost" ? "lost-visual" : "found-visual"}`}>{selectedItem.image ? <img src={selectedItem.image} alt={selectedItem.title} /> : <PackageSearch size={44} />}</div>
            <div className="detail-badges"><span className={`type-pill ${selectedItem.type.toLowerCase()}`}>{selectedItem.type}</span><span className="category-pill">{selectedItem.category}</span><span className="category-pill">{selectedItem.status}</span></div>
            <p className="detail-description">{selectedItem.description}</p>
            <div className="detail-info"><div><MapPin size={16} /><span>{selectedItem.location}</span></div><div><CalendarDays size={16} /><span>{formatDate(selectedItem.date)}</span></div></div>
            {selectedItem.reporter !== "You" && selectedItem.status === "Open" && (
              <button className="primary-button submit-button" onClick={() => { setClaimText(""); setModal("claim"); }}><ShieldCheck size={17} /> {selectedItem.type === "Found" ? "Claim this item" : "I may have found this"}</button>
            )}
            {selectedItem.reporter === "You" && selectedItem.status === "Open" && (
              <button className="secondary-button submit-button" onClick={() => resolveItem(selectedItem)}><CheckCircle2 size={17} /> Mark as resolved</button>
            )}
            <p className="fine-print"><ShieldCheck size={13} /> Ownership should be verified privately before any handover.</p>
          </div>
        </div>
      )}

      {modal === "claim" && selectedItem && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal-panel claim-panel">
            <div className="modal-header"><div><span className="eyebrow">OWNERSHIP VERIFICATION</span><h2>Submit a claim</h2><p>Tell the reporter why you think this item is yours.</p></div><button className="icon-button" onClick={() => setModal(null)}><X size={20} /></button></div>
            <div className="claim-item"><strong>{selectedItem.title}</strong><small>{selectedItem.location} · {formatDate(selectedItem.date)}</small></div>
            <form className="report-form" onSubmit={submitClaim}><label>Proof of ownership</label><textarea rows="4" required value={claimText} onChange={(e) => setClaimText(e.target.value)} placeholder="Describe a unique detail, identifying feature, or something only the owner would know..." /><div className="form-note"><ShieldCheck size={16} /> Your explanation is for verification. Never post passwords or full card numbers.</div><button className="primary-button submit-button" type="submit"><CheckCircle2 size={17} /> Submit claim</button></form>
          </div>
        </div>
      )}

      {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  );
}

export default App;
