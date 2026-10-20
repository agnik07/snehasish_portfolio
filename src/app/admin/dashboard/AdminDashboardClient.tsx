"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  Image as ImageIcon,
  Layers,
  Inbox,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  Upload,
  ArrowUp,
  ArrowDown,
  Mail,
  MessageSquare,
  Search,
  Star,
  RefreshCw,
  Camera,
  AlertCircle,
  CheckCircle2,
  Phone,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import { AdminPayload } from "@/lib/auth";

interface AdminDashboardClientProps {
  admin: AdminPayload;
}

type TabType = "overview" | "projects" | "photos" | "categories" | "inquiries" | "settings";

export default function AdminDashboardClient({ admin }: AdminDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Notifications
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    publishedProjects: 0,
    draftProjects: 0,
    totalPhotographs: 0,
    newInquiries: 0,
    totalInquiries: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiryCounts, setInquiryCounts] = useState({ total: 0, new: 0, contacted: 0, booked: 0, archived: 0 });
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("all");
  const [inquirySearch, setInquirySearch] = useState("");

  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<any[]>([]);

  // Selected for modals / editing
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [selectedProjectForPhotos, setSelectedProjectForPhotos] = useState<string>("");
  const [projectPhotos, setProjectPhotos] = useState<any[]>([]);
  const [selectedPhotoForEdit, setSelectedPhotoForEdit] = useState<any | null>(null);

  // New Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // Uploading state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Overview Data
  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentInquiries(data.recentInquiries || []);
        setRecentProjects(data.recentProjects || []);
      }
    } catch (err) {
      console.error("Failed to fetch overview", err);
    }
  }, []);

  // Fetch Projects Data
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.projects?.length > 0 && !selectedProjectForPhotos) {
          setSelectedProjectForPhotos(data.projects[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  }, [selectedProjectForPhotos]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }, []);

  // Fetch Inquiries
  const fetchInquiries = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (inquiryStatusFilter !== "all") params.set("status", inquiryStatusFilter);
      if (inquirySearch) params.set("q", inquirySearch);

      const res = await fetch(`/api/admin/inquiries?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
        setInquiryCounts(data.counts || { total: 0, new: 0, contacted: 0, booked: 0, archived: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch inquiries", err);
    }
  }, [inquiryStatusFilter, inquirySearch]);

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSiteSettings(data.settings || {});
        setServicesList(data.services || []);
        setTestimonialsList(data.testimonials || []);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  }, []);

  // Fetch Photos for Selected Project
  const fetchProjectPhotos = useCallback(async (projectId: string) => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProjectPhotos(data.project?.photos || []);
      }
    } catch (err) {
      console.error("Failed to fetch project photos", err);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchOverview(), fetchProjects(), fetchCategories(), fetchInquiries(), fetchSettings()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchOverview, fetchProjects, fetchCategories, fetchInquiries, fetchSettings]);

  // When selected project changes in Photos tab
  useEffect(() => {
    if (selectedProjectForPhotos) {
      fetchProjectPhotos(selectedProjectForPhotos);
    }
  }, [selectedProjectForPhotos, fetchProjectPhotos]);

  // When inquiry filter/search changes
  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Logout Handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // Upload helper
  const handleFileUpload = async (files: FileList | null): Promise<string[]> => {
    if (!files || files.length === 0) return [];
    setUploading(true);
    setUploadProgress(`Uploading ${files.length} file(s)...`);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      showToast(data.message || "Photographs uploaded successfully.");
      return data.files.map((f: any) => f.url);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Upload error", "error");
      return [];
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  // Quick Photo upload attached to currently selected project
  const handleAddPhotosToProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProjectForPhotos) {
      showToast("Please select a project first", "error");
      return;
    }
    const urls = await handleFileUpload(e.target.files);
    if (urls.length === 0) return;

    try {
      const res = await fetch(`/api/admin/projects/${selectedProjectForPhotos}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos: urls.map((url) => ({
            url,
            caption: "",
            alt_text: "Photograph",
            aspect_ratio: "landscape",
          })),
        }),
      });

      if (res.ok) {
        showToast("Photographs successfully attached to project.");
        fetchProjectPhotos(selectedProjectForPhotos);
        fetchProjects();
        fetchOverview();
      }
    } catch (err) {
      showToast("Failed to attach photos to project.", "error");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Move photo up or down in order
  const handleMovePhoto = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projectPhotos.length) return;

    const newPhotos = [...projectPhotos];
    const [moved] = newPhotos.splice(index, 1);
    newPhotos.splice(targetIndex, 0, moved);

    setProjectPhotos(newPhotos);

    try {
      await fetch(`/api/admin/projects/${selectedProjectForPhotos}/photos/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoIds: newPhotos.map((p) => p.id),
        }),
      });
      showToast("Photos reordered.");
    } catch {
      showToast("Failed to save order.", "error");
      fetchProjectPhotos(selectedProjectForPhotos);
    }
  };

  // Delete Photo
  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Are you sure you want to remove this photograph from the project?")) return;

    try {
      const res = await fetch(`/api/admin/photos/${photoId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Photograph deleted.");
        fetchProjectPhotos(selectedProjectForPhotos);
        fetchProjects();
        fetchOverview();
      }
    } catch {
      showToast("Failed to delete photo.", "error");
    }
  };

  // Set as Project Cover
  const handleSetCover = async (photoUrl: string) => {
    try {
      const res = await fetch(`/api/admin/projects/${selectedProjectForPhotos}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cover_image_url: photoUrl }),
      });
      if (res.ok) {
        showToast("Project cover photo updated.");
        fetchProjects();
      }
    } catch {
      showToast("Failed to update cover photo.", "error");
    }
  };

  // Save Photo Edit Metadata
  const handleSavePhotoMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhotoForEdit) return;

    try {
      const res = await fetch(`/api/admin/photos/${selectedPhotoForEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: selectedPhotoForEdit.caption,
          alt_text: selectedPhotoForEdit.alt_text,
          aspect_ratio: selectedPhotoForEdit.aspect_ratio,
        }),
      });
      if (res.ok) {
        showToast("Photograph details updated.");
        setSelectedPhotoForEdit(null);
        fetchProjectPhotos(selectedProjectForPhotos);
      }
    } catch {
      showToast("Failed to update photo.", "error");
    }
  };

  // Toggle Project Published Status
  const handleTogglePublishProject = async (project: any) => {
    const newStatus = project.is_published ? 0 : 1;
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: newStatus }),
      });
      if (res.ok) {
        showToast(newStatus ? "Project published to public site." : "Project unpublished (moved to drafts).");
        fetchProjects();
        fetchOverview();
      }
    } catch {
      showToast("Failed to toggle publish status.", "error");
    }
  };

  // Toggle Project Featured
  const handleToggleFeatured = async (project: any) => {
    const newStatus = project.is_featured ? 0 : 1;
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: newStatus }),
      });
      if (res.ok) {
        showToast(newStatus ? "Marked as featured on homepage." : "Removed from homepage featured.");
        fetchProjects();
      }
    } catch {
      showToast("Failed to update featured flag.", "error");
    }
  };

  // Delete Project
  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${projectTitle}" and all its photographs? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Project deleted.");
        fetchProjects();
        fetchOverview();
        if (selectedProjectForPhotos === projectId) {
          setSelectedProjectForPhotos("");
        }
      }
    } catch {
      showToast("Failed to delete project.", "error");
    }
  };

  // Update Inquiry Status
  const handleUpdateInquiryStatus = async (inquiryId: string, status: string, notes?: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        showToast(`Inquiry marked as ${status}.`);
        fetchInquiries();
        fetchOverview();
        if (selectedInquiry && selectedInquiry.id === inquiryId) {
          setSelectedInquiry({ ...selectedInquiry, status, notes: notes !== undefined ? notes : selectedInquiry.notes });
        }
      }
    } catch {
      showToast("Failed to update inquiry.", "error");
    }
  };

  // Delete Inquiry
  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!confirm("Are you sure you want to delete this booking inquiry?")) return;

    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Inquiry deleted.");
        setSelectedInquiry(null);
        fetchInquiries();
        fetchOverview();
      }
    } catch {
      showToast("Failed to delete inquiry.", "error");
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: siteSettings,
          services: servicesList,
          testimonials: testimonialsList,
        }),
      });
      if (res.ok) {
        showToast("Settings and content saved successfully.");
      }
    } catch {
      showToast("Failed to save settings.", "error");
    }
  };

  return (
    <div className="admin-layout">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-banner ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand-box">
          <NextLink href="/" className="sidebar-brand" target="_blank" title="View Public Website">
            <span className="brand-name">SNEHASISH DUTTA</span>
            <span className="brand-badge">STUDIO CMS</span>
          </NextLink>
          <div className="admin-profile-pill">
            <div className="admin-avatar">SD</div>
            <div className="admin-info">
              <span className="admin-name">{admin.name}</span>
              <span className="admin-email">{admin.email}</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            <FolderKanban size={18} />
            <span>Projects ({projects.length})</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === "photos" ? "active" : ""}`}
            onClick={() => setActiveTab("photos")}
          >
            <ImageIcon size={18} />
            <span>Photo Manager</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            <Layers size={18} />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === "inquiries" ? "active" : ""}`}
            onClick={() => setActiveTab("inquiries")}
          >
            <Inbox size={18} />
            <div className="nav-btn-text">
              <span>Inquiries</span>
              {stats.newInquiries > 0 && (
                <span className="badge-new">{stats.newInquiries}</span>
              )}
            </div>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={18} />
            <span>Studio &amp; Content</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <NextLink href="/" target="_blank" className="footer-action-link">
            <ExternalLink size={15} />
            <span>View Public Site</span>
          </NextLink>

          <button type="button" onClick={handleLogout} className="logout-btn">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Workspace */}
      <main className="admin-main">
        {/* Header Bar */}
        <header className="admin-topbar">
          <div className="topbar-title-wrap">
            <h1 className="topbar-title">
              {activeTab === "overview" && "Studio Dashboard"}
              {activeTab === "projects" && "Portfolio Projects"}
              {activeTab === "photos" && "Photographs & Gallery Curator"}
              {activeTab === "categories" && "Photography Categories"}
              {activeTab === "inquiries" && "Client Booking Inquiries"}
              {activeTab === "settings" && "Brand Settings, Services & Bio"}
            </h1>
          </div>

          <div className="topbar-actions">
            {activeTab === "projects" && (
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => setIsNewProjectModalOpen(true)}
              >
                <Plus size={16} />
                <span>New Project</span>
              </button>
            )}

            {activeTab === "categories" && (
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                }}
              >
                <Plus size={16} />
                <span>New Category</span>
              </button>
            )}

            {activeTab === "photos" && (
              <label className="btn-primary btn-sm cursor-pointer">
                <Upload size={16} />
                <span>{uploading ? uploadProgress : "Upload Photographs"}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden-input"
                  onChange={handleAddPhotosToProject}
                  disabled={uploading || !selectedProjectForPhotos}
                />
              </label>
            )}
          </div>
        </header>

        <div className="admin-content-area">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="tab-pane">
              {/* Metric Cards Grid */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <span className="metric-label">Published Projects</span>
                  <span className="metric-val">{stats.publishedProjects}</span>
                  <span className="metric-sub">{stats.draftProjects} unpublished drafts</span>
                </div>

                <div className="metric-card">
                  <span className="metric-label">Curated Photographs</span>
                  <span className="metric-val">{stats.totalPhotographs}</span>
                  <span className="metric-sub">Across all portfolio albums</span>
                </div>

                <div className="metric-card highlight-metric">
                  <span className="metric-label">New Inquiries</span>
                  <span className="metric-val">{stats.newInquiries}</span>
                  <span className="metric-sub">{stats.totalInquiries} total client inquiries</span>
                </div>

                <div className="metric-card">
                  <span className="metric-label">Active Categories</span>
                  <span className="metric-val">{categories.length}</span>
                  <span className="metric-sub">Weddings, Portraits, Pre-Wedding</span>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="quick-actions-card">
                <h3 className="card-heading">Quick Studio Actions</h3>
                <div className="actions-btn-row">
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => setIsNewProjectModalOpen(true)}
                  >
                    <Plus size={16} />
                    <span>Create New Story</span>
                  </button>

                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => setActiveTab("photos")}
                  >
                    <Upload size={16} />
                    <span>Upload Photographs</span>
                  </button>

                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => setActiveTab("inquiries")}
                  >
                    <Inbox size={16} />
                    <span>Review Inquiries ({stats.newInquiries} New)</span>
                  </button>

                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings size={16} />
                    <span>Edit Bio &amp; Offerings</span>
                  </button>
                </div>
              </div>

              {/* Recent Inquiries & Projects 2-col */}
              <div className="dashboard-columns">
                <div className="dash-col">
                  <div className="col-header">
                    <h3 className="card-heading">Recent Booking Inquiries</h3>
                    <button
                      type="button"
                      className="text-btn"
                      onClick={() => setActiveTab("inquiries")}
                    >
                      View All
                    </button>
                  </div>

                  {recentInquiries.length === 0 ? (
                    <div className="empty-dash-box">
                      <p>No inquiries yet. Submissions from the public contact form will appear here.</p>
                    </div>
                  ) : (
                    <div className="inquiry-mini-list">
                      {recentInquiries.map((inq) => (
                        <div
                          key={inq.id}
                          className="inquiry-mini-card"
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setActiveTab("inquiries");
                          }}
                        >
                          <div className="mini-left">
                            <span className="mini-name">{inq.name}</span>
                            <span className="mini-shoot">{inq.shoot_type} • {inq.location || "Location not set"}</span>
                          </div>
                          <div className="mini-right">
                            <span className={`status-pill status-${inq.status}`}>{inq.status}</span>
                            <span className="mini-date">{new Date(inq.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="dash-col">
                  <div className="col-header">
                    <h3 className="card-heading">Published Projects</h3>
                    <button
                      type="button"
                      className="text-btn"
                      onClick={() => setActiveTab("projects")}
                    >
                      Manage All
                    </button>
                  </div>

                  <div className="projects-mini-list">
                    {recentProjects.map((proj) => (
                      <div key={proj.id} className="project-mini-card">
                        <img src={proj.cover_image_url} alt="" className="mini-cover" />
                        <div className="mini-proj-info">
                          <span className="mini-proj-title">{proj.title}</span>
                          <span className="mini-proj-cat">{proj.category_name}</span>
                        </div>
                        <div className="mini-proj-actions">
                          {proj.is_featured === 1 && (
                            <span className="featured-badge" title="Featured on Homepage">★</span>
                          )}
                          <NextLink
                            href={`/portfolio/${proj.slug}`}
                            target="_blank"
                            className="icon-action-btn"
                            title="View Public Story"
                          >
                            <ExternalLink size={15} />
                          </NextLink>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECTS */}
          {activeTab === "projects" && (
            <div className="tab-pane">
              <div className="table-card">
                <div className="table-header-bar">
                  <span className="table-title">All Photography Stories ({projects.length})</span>
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    onClick={() => setIsNewProjectModalOpen(true)}
                  >
                    <Plus size={15} />
                    <span>Create Project</span>
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Cover</th>
                        <th>Title &amp; Slug</th>
                        <th>Category</th>
                        <th>Clients / Location</th>
                        <th>Photos</th>
                        <th>Featured</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((proj) => (
                        <tr key={proj.id}>
                          <td style={{ width: 80 }}>
                            <img src={proj.cover_image_url} alt="" className="table-thumb" />
                          </td>
                          <td>
                            <div className="table-proj-title">{proj.title}</div>
                            <div className="table-proj-slug">/portfolio/{proj.slug}</div>
                          </td>
                          <td>
                            <span className="cat-pill">{proj.category_name}</span>
                          </td>
                          <td>
                            <div className="client-text">{proj.client_names || "—"}</div>
                            <div className="location-text">{proj.location || "—"}</div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="photo-count-badge"
                              onClick={() => {
                                setSelectedProjectForPhotos(proj.id);
                                setActiveTab("photos");
                              }}
                              title="Open in Photo Manager"
                            >
                              <ImageIcon size={13} />
                              <span>{proj.photo_count} photos</span>
                            </button>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`star-btn ${proj.is_featured ? "star-active" : ""}`}
                              onClick={() => handleToggleFeatured(proj)}
                              title="Toggle Homepage Featured"
                            >
                              <Star size={16} />
                            </button>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`status-pill ${proj.is_published ? "status-booked" : "status-archived"}`}
                              onClick={() => handleTogglePublishProject(proj)}
                              title="Click to toggle publish/draft"
                            >
                              {proj.is_published ? "Published" : "Draft"}
                            </button>
                          </td>
                          <td className="text-right">
                            <div className="row-actions">
                              <NextLink
                                href={`/portfolio/${proj.slug}`}
                                target="_blank"
                                className="action-icon-link"
                                title="Preview Public Page"
                              >
                                <Eye size={16} />
                              </NextLink>

                              <button
                                type="button"
                                className="action-icon-btn"
                                onClick={() => setEditingProject(proj)}
                                title="Edit Project Details"
                              >
                                <Edit size={16} />
                              </button>

                              <button
                                type="button"
                                className="action-icon-btn text-danger"
                                onClick={() => handleDeleteProject(proj.id, proj.title)}
                                title="Delete Project"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PHOTOS & GALLERY CURATOR */}
          {activeTab === "photos" && (
            <div className="tab-pane">
              <div className="photo-manager-header">
                <div className="project-picker-row">
                  <label htmlFor="select-project-photos" className="picker-label">
                    Select Story to Manage:
                  </label>
                  <select
                    id="select-project-photos"
                    value={selectedProjectForPhotos}
                    onChange={(e) => setSelectedProjectForPhotos(e.target.value)}
                    className="form-select project-dropdown"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.photo_count} photos)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="upload-controls">
                  <label className="btn-primary btn-sm cursor-pointer">
                    <Upload size={16} />
                    <span>{uploading ? uploadProgress : "Upload Batch Photos"}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden-input"
                      onChange={handleAddPhotosToProject}
                      disabled={uploading || !selectedProjectForPhotos}
                    />
                  </label>
                </div>
              </div>

              {/* Photos Grid */}
              {projectPhotos.length === 0 ? (
                <div className="empty-photos-box">
                  <Camera size={40} className="empty-icon" />
                  <h3>No photographs in this project yet</h3>
                  <p>Click &apos;Upload Batch Photos&apos; above to upload high-resolution JPEG, PNG, or WebP images.</p>
                </div>
              ) : (
                <div className="curator-grid">
                  {projectPhotos.map((photo, idx) => (
                    <div key={photo.id} className="curator-card">
                      <div className="curator-thumb-wrap">
                        <img src={photo.url} alt="" className="curator-img" />
                        <span className="order-badge">#{idx + 1}</span>

                        <div className="curator-overlay-actions">
                          <button
                            type="button"
                            className="curator-btn"
                            disabled={idx === 0}
                            onClick={() => handleMovePhoto(idx, "up")}
                            title="Move Earlier"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            className="curator-btn"
                            disabled={idx === projectPhotos.length - 1}
                            onClick={() => handleMovePhoto(idx, "down")}
                            title="Move Later"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="curator-card-footer">
                        <div className="curator-caption-snippet">
                          {photo.caption || <span className="no-caption">No caption set</span>}
                        </div>
                        <div className="curator-btn-row">
                          <button
                            type="button"
                            className="btn-tiny"
                            onClick={() => handleSetCover(photo.url)}
                            title="Set as Project Cover"
                          >
                            Set Cover
                          </button>

                          <button
                            type="button"
                            className="btn-tiny"
                            onClick={() => setSelectedPhotoForEdit(photo)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn-tiny btn-tiny-danger"
                            onClick={() => handleDeletePhoto(photo.id)}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CATEGORIES */}
          {activeTab === "categories" && (
            <div className="tab-pane">
              <div className="table-card">
                <div className="table-header-bar">
                  <span className="table-title">Photography Categories ({categories.length})</span>
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    onClick={() => {
                      setEditingCategory(null);
                      setIsCategoryModalOpen(true);
                    }}
                  >
                    <Plus size={15} />
                    <span>Create Category</span>
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Description</th>
                        <th>Assigned Projects</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => (
                        <tr key={c.id}>
                          <td style={{ width: 70 }}>#{c.order_index}</td>
                          <td><strong>{c.name}</strong></td>
                          <td><code>{c.slug}</code></td>
                          <td style={{ maxWidth: 350 }}>{c.description || "—"}</td>
                          <td>
                            <span className="cat-count-badge">
                              {c.project_count} project(s)
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="row-actions">
                              <button
                                type="button"
                                className="action-icon-btn"
                                onClick={() => {
                                  setEditingCategory(c);
                                  setIsCategoryModalOpen(true);
                                }}
                                title="Edit Category"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                className="action-icon-btn text-danger"
                                onClick={async () => {
                                  if (!confirm(`Delete category "${c.name}"?`)) return;
                                  const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
                                  const data = await res.json();
                                  if (!res.ok) {
                                    showToast(data.error || "Failed to delete category", "error");
                                  } else {
                                    showToast("Category deleted.");
                                    fetchCategories();
                                  }
                                }}
                                title="Delete Category"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INQUIRIES */}
          {activeTab === "inquiries" && (
            <div className="tab-pane">
              <div className="inquiry-filters-bar">
                <div className="inquiry-status-tabs">
                  <button
                    type="button"
                    className={`status-filter-tab ${inquiryStatusFilter === "all" ? "active" : ""}`}
                    onClick={() => setInquiryStatusFilter("all")}
                  >
                    All ({inquiryCounts.total})
                  </button>
                  <button
                    type="button"
                    className={`status-filter-tab ${inquiryStatusFilter === "new" ? "active" : ""}`}
                    onClick={() => setInquiryStatusFilter("new")}
                  >
                    New ({inquiryCounts.new})
                  </button>
                  <button
                    type="button"
                    className={`status-filter-tab ${inquiryStatusFilter === "contacted" ? "active" : ""}`}
                    onClick={() => setInquiryStatusFilter("contacted")}
                  >
                    Contacted ({inquiryCounts.contacted})
                  </button>
                  <button
                    type="button"
                    className={`status-filter-tab ${inquiryStatusFilter === "booked" ? "active" : ""}`}
                    onClick={() => setInquiryStatusFilter("booked")}
                  >
                    Booked ({inquiryCounts.booked})
                  </button>
                  <button
                    type="button"
                    className={`status-filter-tab ${inquiryStatusFilter === "archived" ? "active" : ""}`}
                    onClick={() => setInquiryStatusFilter("archived")}
                  >
                    Archived ({inquiryCounts.archived})
                  </button>
                </div>

                <div className="search-wrap">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search client, email, location..."
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              {/* Inquiries Table */}
              <div className="table-card">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date Received</th>
                        <th>Client</th>
                        <th>Shoot Type</th>
                        <th>Event Date / Location</th>
                        <th>Budget</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8">
                            No inquiries match the current filter.
                          </td>
                        </tr>
                      ) : (
                        inquiries.map((inq) => (
                          <tr key={inq.id} className="cursor-pointer" onClick={() => setSelectedInquiry(inq)}>
                            <td>
                              <div className="inq-time">{new Date(inq.created_at).toLocaleDateString()}</div>
                              <small className="inq-subtime">{new Date(inq.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                            </td>
                            <td>
                              <div className="inq-client-name">{inq.name}</div>
                              <div className="inq-client-email">{inq.email}</div>
                              {inq.phone && <div className="inq-client-phone">{inq.phone}</div>}
                            </td>
                            <td>
                              <span className="cat-pill">{inq.shoot_type}</span>
                            </td>
                            <td>
                              <div>{inq.preferred_date || "Flexible / Unset"}</div>
                              <small className="text-muted">{inq.location || "Location unset"}</small>
                            </td>
                            <td>{inq.budget || "—"}</td>
                            <td>
                              <span className={`status-pill status-${inq.status}`}>{inq.status}</span>
                            </td>
                            <td className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="row-actions">
                                <button
                                  type="button"
                                  className="action-icon-btn"
                                  onClick={() => setSelectedInquiry(inq)}
                                  title="Open Detail Modal"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  type="button"
                                  className="action-icon-btn text-danger"
                                  onClick={() => handleDeleteInquiry(inq.id)}
                                  title="Delete Inquiry"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS & CONTENT */}
          {activeTab === "settings" && (
            <div className="tab-pane">
              <form onSubmit={handleSaveSettings} className="settings-form">
                <div className="settings-section-card">
                  <h3 className="card-heading">Brand Identity &amp; Wordmark</h3>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Brand Wordmark</label>
                      <input
                        type="text"
                        value={siteSettings.brand_name || ""}
                        onChange={(e) => setSiteSettings({ ...siteSettings, brand_name: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tagline</label>
                      <input
                        type="text"
                        value={siteSettings.brand_tagline || ""}
                        onChange={(e) => setSiteSettings({ ...siteSettings, brand_tagline: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-section-card">
                  <h3 className="card-heading">Hero Section</h3>
                  <div className="form-group">
                    <label className="form-label">Hero Headline</label>
                    <input
                      type="text"
                      value={siteSettings.hero_headline || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, hero_headline: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hero Subheadline</label>
                    <textarea
                      value={siteSettings.hero_subheadline || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, hero_subheadline: e.target.value })}
                      className="form-textarea"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hero Image URL</label>
                    <div className="input-with-upload">
                      <input
                        type="text"
                        value={siteSettings.hero_image_url || ""}
                        onChange={(e) => setSiteSettings({ ...siteSettings, hero_image_url: e.target.value })}
                        className="form-input"
                      />
                      <label className="btn-outline btn-sm cursor-pointer upload-btn-inline">
                        <Upload size={14} />
                        <span>Upload File</span>
                        <input
                          ref={coverFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden-input"
                          onChange={async (e) => {
                            const urls = await handleFileUpload(e.target.files);
                            if (urls.length > 0) {
                              setSiteSettings({ ...siteSettings, hero_image_url: urls[0] });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-section-card">
                  <h3 className="card-heading">Photographer Biography &amp; Philosophy</h3>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Artist Name</label>
                      <input
                        type="text"
                        value={siteSettings.photographer_name || ""}
                        onChange={(e) => setSiteSettings({ ...siteSettings, photographer_name: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Service Area</label>
                      <input
                        type="text"
                        value={siteSettings.service_area || ""}
                        onChange={(e) => setSiteSettings({ ...siteSettings, service_area: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Biography</label>
                    <textarea
                      value={siteSettings.photographer_bio || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, photographer_bio: e.target.value })}
                      className="form-textarea"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Creative Philosophy</label>
                    <textarea
                      value={siteSettings.photographer_philosophy || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, photographer_philosophy: e.target.value })}
                      className="form-textarea"
                    />
                  </div>
                </div>

                <div className="settings-section-card">
                  <h3 className="card-heading">Direct Contact &amp; Channels</h3>
                  <div className="form-row-3">
                    <div className="form-group">
                      <label className="form-label">Business Inquiries Email</label>
                      <input
                        type="email"
                        value={siteSettings.contact_email || ""}
                        onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">WhatsApp Contact Number</label>
                      <input
                        type="text"
                        value={siteSettings.whatsapp_phone || ""}
                        onChange={(e) => setSiteSettings({ ...siteSettings, whatsapp_phone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Instagram Profile URL</label>
                      <input
                        type="text"
                        value={siteSettings.instagram_url || ""}
                        onChange={(e) => setSiteSettings({ ...siteSettings, instagram_url: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="save-bar">
                  <button type="submit" className="btn-primary save-btn">
                    <Check size={16} />
                    <span>Save Studio Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: INQUIRY DETAIL MODAL */}
      {selectedInquiry && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedInquiry(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="header-titles">
                <span className="modal-eyebrow">BOOKING INQUIRY DETAIL</span>
                <h3 className="modal-heading">{selectedInquiry.name}</h3>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedInquiry(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="inquiry-status-selector-row">
                <span className="status-label">Current Pipeline Status:</span>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => handleUpdateInquiryStatus(selectedInquiry.id, e.target.value)}
                  className="form-select status-dropdown"
                >
                  <option value="new">New (Uncontacted)</option>
                  <option value="contacted">Contacted</option>
                  <option value="booked">Booked (Commission Confirmed)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="inquiry-info-grid">
                <div className="info-item">
                  <span className="info-lbl">Email Address</span>
                  <a href={`mailto:${selectedInquiry.email}`} className="info-val info-link">
                    <Mail size={14} />
                    <span>{selectedInquiry.email}</span>
                  </a>
                </div>

                <div className="info-item">
                  <span className="info-lbl">Phone / WhatsApp</span>
                  {selectedInquiry.phone ? (
                    <a
                      href={`https://wa.me/${selectedInquiry.phone.replace(/[^\d+]/g, "").replace(/^\+/, "")}?text=${encodeURIComponent(`Hello ${selectedInquiry.name}, thank you for reaching out regarding photography.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="info-val info-link"
                    >
                      <Phone size={14} />
                      <span>{selectedInquiry.phone} (WhatsApp)</span>
                    </a>
                  ) : (
                    <span className="info-val text-muted">Not provided</span>
                  )}
                </div>

                <div className="info-item">
                  <span className="info-lbl">Shoot Discipline</span>
                  <span className="info-val">{selectedInquiry.shoot_type}</span>
                </div>

                <div className="info-item">
                  <span className="info-lbl">Preferred Date</span>
                  <span className="info-val">{selectedInquiry.preferred_date || "Not specified"}</span>
                </div>

                <div className="info-item">
                  <span className="info-lbl">Event Location</span>
                  <span className="info-val">{selectedInquiry.location || "Not specified"}</span>
                </div>

                <div className="info-item">
                  <span className="info-lbl">Approximate Budget</span>
                  <span className="info-val">{selectedInquiry.budget || "Not specified"}</span>
                </div>
              </div>

              <div className="inquiry-message-card">
                <span className="info-lbl">Client Message &amp; Vision:</span>
                <p className="message-content">{selectedInquiry.message}</p>
              </div>

              <div className="private-notes-block">
                <span className="info-lbl">Private Photographer Notes:</span>
                <textarea
                  placeholder="Record call summaries, bespoke package quotes, contracts dispatched..."
                  defaultValue={selectedInquiry.notes || ""}
                  onBlur={(e) => handleUpdateInquiryStatus(selectedInquiry.id, selectedInquiry.status, e.target.value)}
                  className="form-textarea notes-area"
                />
              </div>
            </div>

            <div className="admin-modal-footer">
              <div className="footer-left-actions">
                <button
                  type="button"
                  className="btn-outline text-danger"
                  onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                >
                  <Trash2 size={15} />
                  <span>Delete Inquiry</span>
                </button>
              </div>

              <div className="footer-right-actions">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(`Photography Inquiry - Snehasish Dutta [${selectedInquiry.shoot_type}]`)}`}
                  className="btn-primary btn-sm"
                >
                  <Mail size={15} />
                  <span>Reply via Email</span>
                </a>

                {selectedInquiry.phone && (
                  <a
                    href={`https://wa.me/${selectedInquiry.phone.replace(/[^\d+]/g, "").replace(/^\+/, "")}?text=${encodeURIComponent(`Hello ${selectedInquiry.name}, thank you for your message regarding your upcoming shoot.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary btn-sm btn-whatsapp"
                  >
                    <MessageSquare size={15} />
                    <span>Chat on WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE / EDIT PROJECT MODAL */}
      {(isNewProjectModalOpen || editingProject) && (
        <div
          className="admin-modal-backdrop"
          onClick={() => {
            setIsNewProjectModalOpen(false);
            setEditingProject(null);
          }}
        >
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="modal-heading">
                {editingProject ? `Edit Project: ${editingProject.title}` : "Create New Photography Story"}
              </h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => {
                  setIsNewProjectModalOpen(false);
                  setEditingProject(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);

                const payload = {
                  title: formData.get("title"),
                  slug: formData.get("slug"),
                  category_id: formData.get("category_id"),
                  client_names: formData.get("client_names"),
                  location: formData.get("location"),
                  shoot_date: formData.get("shoot_date"),
                  cover_image_url: formData.get("cover_image_url"),
                  description: formData.get("description"),
                  is_featured: formData.get("is_featured") === "on" ? 1 : 0,
                  is_published: formData.get("is_published") === "on" ? 1 : 0,
                  order_index: formData.get("order_index"),
                };

                try {
                  const url = editingProject
                    ? `/api/admin/projects/${editingProject.id}`
                    : "/api/admin/projects";
                  const method = editingProject ? "PUT" : "POST";

                  const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });

                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Failed to save project.");

                  showToast(editingProject ? "Project updated." : "Project created successfully.");
                  setIsNewProjectModalOpen(false);
                  setEditingProject(null);
                  fetchProjects();
                  fetchOverview();
                } catch (err: unknown) {
                  showToast(err instanceof Error ? err.message : "Error saving project", "error");
                }
              }}
              className="admin-modal-form"
            >
              <div className="admin-modal-body">
                <div className="form-group">
                  <label className="form-label">Project Title *</label>
                  <input
                    name="title"
                    type="text"
                    required
                    defaultValue={editingProject?.title || ""}
                    placeholder="e.g. Royal Twilight at City Palace"
                    className="form-input"
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">URL Slug (leave blank to auto-generate)</label>
                    <input
                      name="slug"
                      type="text"
                      defaultValue={editingProject?.slug || ""}
                      placeholder="e.g. royal-twilight-city-palace"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      name="category_id"
                      required
                      defaultValue={editingProject?.category_id || categories[0]?.id || ""}
                      className="form-select"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Client / Couple Names (Optional)</label>
                    <input
                      name="client_names"
                      type="text"
                      defaultValue={editingProject?.client_names || ""}
                      placeholder="e.g. Aarav &amp; Meera"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shoot Location</label>
                    <input
                      name="location"
                      type="text"
                      defaultValue={editingProject?.location || ""}
                      placeholder="e.g. Udaipur, Rajasthan"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Shoot Date</label>
                    <input
                      name="shoot_date"
                      type="text"
                      defaultValue={editingProject?.shoot_date || ""}
                      placeholder="e.g. November 2025"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Order Priority Index</label>
                    <input
                      name="order_index"
                      type="number"
                      defaultValue={editingProject?.order_index || 0}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Photograph URL *</label>
                  <input
                    name="cover_image_url"
                    type="text"
                    required
                    defaultValue={editingProject?.cover_image_url || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85"}
                    placeholder="https://... or /uploads/..."
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Story Narrative / Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    defaultValue={editingProject?.description || ""}
                    placeholder="Write the editorial narrative describing the emotions, aesthetic, and ceremony..."
                    className="form-textarea"
                  />
                </div>

                <div className="checkboxes-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_published"
                      defaultChecked={editingProject ? Boolean(editingProject.is_published) : true}
                    />
                    <span>Publish Immediately (Visible to Public Visitors)</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_featured"
                      defaultChecked={editingProject ? Boolean(editingProject.is_featured) : false}
                    />
                    <span>Feature on Homepage Selected Work</span>
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    setIsNewProjectModalOpen(false);
                    setEditingProject(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <span>{editingProject ? "Save Changes" : "Create Story"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT PHOTO METADATA MODAL */}
      {selectedPhotoForEdit && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedPhotoForEdit(null)}>
          <div className="admin-modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="modal-heading">Edit Photograph Details</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedPhotoForEdit(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePhotoMetadata} className="admin-modal-form">
              <div className="admin-modal-body">
                <div className="preview-wrap">
                  <img src={selectedPhotoForEdit.url} alt="" className="photo-preview-img" />
                </div>

                <div className="form-group">
                  <label className="form-label">Editorial Caption (Optional)</label>
                  <input
                    type="text"
                    value={selectedPhotoForEdit.caption || ""}
                    onChange={(e) => setSelectedPhotoForEdit({ ...selectedPhotoForEdit, caption: e.target.value })}
                    placeholder="e.g. Twilight vows beneath ancient sandstone arches..."
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alt Text (Accessibility &amp; SEO)</label>
                  <input
                    type="text"
                    value={selectedPhotoForEdit.alt_text || ""}
                    onChange={(e) => setSelectedPhotoForEdit({ ...selectedPhotoForEdit, alt_text: e.target.value })}
                    placeholder="e.g. Bride smiling with marigold garland"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Visual Aspect Ratio</label>
                  <select
                    value={selectedPhotoForEdit.aspect_ratio || "landscape"}
                    onChange={(e) => setSelectedPhotoForEdit({ ...selectedPhotoForEdit, aspect_ratio: e.target.value })}
                    className="form-select"
                  >
                    <option value="landscape">Landscape (3:2 / 16:9 cinematic)</option>
                    <option value="portrait">Portrait (4:5 / 2:3 vertical)</option>
                    <option value="square">Square (1:1)</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setSelectedPhotoForEdit(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <span>Save Photo Metadata</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CATEGORY CREATE / EDIT MODAL */}
      {isCategoryModalOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          }}
        >
          <div className="admin-modal-card" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="modal-heading">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create Category"}
              </h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);

                const payload = {
                  name: formData.get("name"),
                  slug: formData.get("slug"),
                  description: formData.get("description"),
                  order_index: formData.get("order_index"),
                };

                try {
                  const url = editingCategory
                    ? `/api/admin/categories/${editingCategory.id}`
                    : "/api/admin/categories";
                  const method = editingCategory ? "PUT" : "POST";

                  const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });

                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Failed to save category.");

                  showToast(editingCategory ? "Category updated." : "Category created.");
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                  fetchCategories();
                } catch (err: unknown) {
                  showToast(err instanceof Error ? err.message : "Error saving category", "error");
                }
              }}
              className="admin-modal-form"
            >
              <div className="admin-modal-body">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={editingCategory?.name || ""}
                    placeholder="e.g. Post-Wedding"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Slug (Optional)</label>
                  <input
                    name="slug"
                    type="text"
                    defaultValue={editingCategory?.slug || ""}
                    placeholder="e.g. post-wedding"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    rows={2}
                    defaultValue={editingCategory?.description || ""}
                    placeholder="Brief description of this genre..."
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Display Order Index</label>
                  <input
                    name="order_index"
                    type="number"
                    defaultValue={editingCategory?.order_index || 10}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <span>{editingCategory ? "Save Changes" : "Create"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background-color: #141312;
          color: #FAF8F5;
        }

        /* Toast */
        .toast-banner {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 99999;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-radius: 2px;
          font-size: 0.875rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          animation: slideIn 0.3s ease-out;
        }

        .toast-success {
          background-color: #243F2D;
          border: 1px solid #386A46;
          color: #D2EBD9;
        }

        .toast-error {
          background-color: #4A1E1E;
          border: 1px solid #7F2D2D;
          color: #F8D2D2;
        }

        /* Sidebar */
        .admin-sidebar {
          width: 280px;
          background-color: #1B1918;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .sidebar-brand-box {
          padding: 2rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .sidebar-brand {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: #FAF8F5;
        }

        .brand-name {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .brand-badge {
          font-family: var(--font-sans);
          font-size: 0.625rem;
          letter-spacing: 0.22em;
          color: var(--accent-gold);
          margin-top: 2px;
        }

        .admin-profile-pill {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.04);
          padding: 0.65rem 0.85rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .admin-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent-gold);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .admin-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .admin-name {
          font-size: 0.8125rem;
          font-weight: 500;
          color: #FAF8F5;
        }

        .admin-email {
          font-size: 0.6875rem;
          color: #8A857D;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-nav {
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          width: 100%;
          padding: 0.8rem 1rem;
          border-radius: 4px;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: #A39E96;
          transition: all 0.2s;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .nav-btn:hover {
          color: #FAF8F5;
          background: rgba(255, 255, 255, 0.04);
        }

        .nav-btn.active {
          color: #FAF8F5;
          background: rgba(181, 142, 78, 0.15);
          font-weight: 500;
          border-left: 3px solid var(--accent-gold);
        }

        .nav-btn-text {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex: 1;
        }

        .badge-new {
          background-color: var(--accent-gold);
          color: #FFFFFF;
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 0.15rem 0.55rem;
          border-radius: 9999px;
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-action-link {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.8125rem;
          color: #A39E96;
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-action-link:hover {
          color: #FAF8F5;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.8125rem;
          color: #D67A7A;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: opacity 0.2s;
        }

        .logout-btn:hover {
          opacity: 0.8;
        }

        /* Main Workspace */
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background-color: #141312;
        }

        .admin-topbar {
          height: var(--header-height);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0 clamp(1.5rem, 4vw, 3rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #181615;
        }

        .topbar-title {
          font-family: var(--font-serif);
          font-size: 1.65rem;
          color: #FAF8F5;
        }

        .btn-sm {
          padding: 0.65rem 1.35rem;
          font-size: 0.75rem;
        }

        .admin-content-area {
          padding: clamp(1.5rem, 4vw, 3rem);
          flex: 1;
          overflow-y: auto;
        }

        .tab-pane {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          max-width: 1400px;
        }

        /* Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }

        .metric-card {
          background-color: #1F1D1B;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .highlight-metric {
          border-color: rgba(181, 142, 78, 0.35);
          background: linear-gradient(180deg, rgba(181, 142, 78, 0.1) 0%, #1F1D1B 100%);
        }

        .metric-label {
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8A857D;
        }

        .metric-val {
          font-family: var(--font-serif);
          font-size: 2.75rem;
          color: #FAF8F5;
          line-height: 1;
          margin: 0.25rem 0;
        }

        .metric-sub {
          font-size: 0.75rem;
          color: #A39E96;
        }

        /* Quick actions */
        .quick-actions-card {
          background-color: #1F1D1B;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .card-heading {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          color: #FAF8F5;
        }

        .actions-btn-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          background-color: #272522;
          color: #FAF8F5;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.75rem 1.25rem;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background-color: var(--accent-gold);
          border-color: var(--accent-gold);
        }

        /* Dashboard 2-col */
        .dashboard-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .dash-col {
          background-color: #1F1D1B;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .col-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .text-btn {
          background: none;
          border: none;
          color: var(--accent-gold);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
        }

        .inquiry-mini-list, .projects-mini-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .inquiry-mini-card {
          padding: 1rem;
          background: #181615;
          border: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .inquiry-mini-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }

        .mini-left {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mini-name {
          font-weight: 500;
          font-size: 0.9375rem;
          color: #FAF8F5;
        }

        .mini-shoot {
          font-size: 0.75rem;
          color: #8A857D;
        }

        .mini-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.35rem;
        }

        .mini-date {
          font-size: 0.6875rem;
          color: #615C55;
        }

        .project-mini-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem;
          background: #181615;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .mini-cover {
          width: 52px;
          height: 38px;
          object-fit: cover;
          border-radius: 2px;
        }

        .mini-proj-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .mini-proj-title {
          font-size: 0.875rem;
          color: #FAF8F5;
        }

        .mini-proj-cat {
          font-size: 0.75rem;
          color: #8A857D;
        }

        .mini-proj-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .featured-badge {
          color: var(--accent-gold);
          font-size: 1.1rem;
        }

        /* Tables */
        .table-card {
          background-color: #1F1D1B;
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
        }

        .table-header-bar {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .table-title {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          color: #FAF8F5;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          text-align: left;
        }

        .admin-table th {
          padding: 1rem 1.5rem;
          color: #8A857D;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .admin-table td {
          padding: 1.15rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #FAF8F5;
          vertical-align: middle;
        }

        .admin-table tr:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }

        .table-thumb {
          width: 60px;
          height: 42px;
          object-fit: cover;
          border-radius: 2px;
        }

        .table-proj-title {
          font-weight: 500;
          color: #FAF8F5;
        }

        .table-proj-slug {
          font-size: 0.75rem;
          color: #8A857D;
        }

        .cat-pill {
          background: rgba(255, 255, 255, 0.06);
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.6875rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .photo-count-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.06);
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          color: #FAF8F5;
          font-size: 0.75rem;
          border: none;
          cursor: pointer;
        }

        .photo-count-badge:hover {
          background: var(--accent-gold);
        }

        .star-btn {
          background: none;
          border: none;
          color: #4A4640;
          cursor: pointer;
        }

        .star-active {
          color: var(--accent-gold);
        }

        .status-pill {
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.6875rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600;
          display: inline-block;
          border: none;
          cursor: pointer;
        }

        .status-new {
          background: rgba(181, 142, 78, 0.2);
          color: #E2B771;
        }

        .status-contacted {
          background: rgba(70, 130, 180, 0.2);
          color: #92C2EC;
        }

        .status-booked {
          background: rgba(56, 106, 70, 0.25);
          color: #A3D8B0;
        }

        .status-archived {
          background: rgba(100, 100, 100, 0.2);
          color: #A39E96;
        }

        .row-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        .action-icon-btn, .action-icon-link {
          background: none;
          border: none;
          color: #8A857D;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .action-icon-btn:hover, .action-icon-link:hover {
          color: #FAF8F5;
        }

        .text-danger {
          color: #C85A5A !important;
        }

        .text-danger:hover {
          color: #E87A7A !important;
        }

        /* Photo Curator */
        .photo-manager-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          background: #1F1D1B;
          border: 1px solid rgba(255, 255, 255, 0.08);
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .project-picker-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .picker-label {
          font-size: 0.8125rem;
          color: #8A857D;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .project-dropdown {
          background: #141312;
          color: #FAF8F5;
          border-color: rgba(255, 255, 255, 0.15);
          min-width: 320px;
        }

        .hidden-input {
          display: none;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .curator-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .curator-card {
          background: #1F1D1B;
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .curator-thumb-wrap {
          position: relative;
          aspect-ratio: 16 / 11;
          background: #141312;
        }

        .curator-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .order-badge {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          background: rgba(0, 0, 0, 0.7);
          color: #FAF8F5;
          font-size: 0.6875rem;
          padding: 0.15rem 0.5rem;
          border-radius: 2px;
        }

        .curator-overlay-actions {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          display: flex;
          gap: 0.25rem;
        }

        .curator-btn {
          width: 28px;
          height: 28px;
          background: rgba(0, 0, 0, 0.75);
          color: #FAF8F5;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 2px;
        }

        .curator-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .curator-card-footer {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .curator-caption-snippet {
          font-size: 0.75rem;
          color: #C2BCB2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .no-caption {
          color: #615C55;
          font-style: italic;
        }

        .curator-btn-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .btn-tiny {
          background: #282522;
          color: #FAF8F5;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.25rem 0.6rem;
          font-size: 0.6875rem;
          cursor: pointer;
          border-radius: 2px;
        }

        .btn-tiny:hover {
          background: var(--accent-gold);
        }

        .btn-tiny-danger:hover {
          background: #7F2D2D !important;
        }

        .empty-photos-box {
          padding: 5rem 2rem;
          text-align: center;
          background: #1F1D1B;
          border: 1px dashed rgba(255, 255, 255, 0.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        :global(.empty-icon) {
          color: var(--accent-gold);
          opacity: 0.8;
        }

        /* Inquiries Tab */
        .inquiry-filters-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .inquiry-status-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .status-filter-tab {
          padding: 0.5rem 1rem;
          background: #1F1D1B;
          color: #8A857D;
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          border-radius: 2px;
        }

        .status-filter-tab.active {
          background: var(--accent-gold);
          color: #FFFFFF;
          border-color: var(--accent-gold);
        }

        .search-wrap {
          position: relative;
          min-width: 280px;
        }

        :global(.search-icon) {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #8A857D;
        }

        .search-input {
          width: 100%;
          background: #1F1D1B;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.65rem 1rem 0.65rem 2.5rem;
          color: #FAF8F5;
          font-size: 0.8125rem;
          border-radius: 2px;
        }

        /* Settings Form */
        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .settings-section-card {
          background: #1F1D1B;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-with-upload {
          display: flex;
          gap: 1rem;
        }

        .upload-btn-inline {
          white-space: nowrap;
          color: #FAF8F5;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .save-bar {
          display: flex;
          justify-content: flex-end;
          padding: 1.5rem 0;
        }

        .save-btn {
          padding: 1.15rem 2.75rem;
        }

        /* Modal Styles */
        .admin-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(10, 9, 8, 0.88);
          backdrop-filter: blur(10px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: fadeIn 0.2s ease-out;
        }

        .admin-modal-card {
          background-color: #1F1D1B;
          border: 1px solid rgba(255, 255, 255, 0.12);
          width: 100%;
          max-width: 680px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
        }

        .admin-modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-eyebrow {
          font-size: 0.6875rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent-gold);
        }

        .modal-heading {
          font-family: var(--font-serif);
          font-size: 1.6rem;
          color: #FAF8F5;
        }

        .close-modal-btn {
          background: none;
          border: none;
          color: #8A857D;
          cursor: pointer;
        }

        .close-modal-btn:hover {
          color: #FAF8F5;
        }

        .admin-modal-body {
          padding: 2rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .admin-modal-footer {
          padding: 1.25rem 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: #181615;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .footer-right-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-whatsapp {
          background: #25633C;
          border-color: #25633C;
        }

        .btn-whatsapp:hover {
          background: #1E4E30;
        }

        .inquiry-status-selector-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #141312;
          padding: 1rem 1.25rem;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .status-dropdown {
          background: #1E1D1B;
          color: #FAF8F5;
          border-color: rgba(255, 255, 255, 0.15);
          width: auto;
        }

        .inquiry-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          background: #141312;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-lbl {
          font-size: 0.6875rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8A857D;
        }

        .info-val {
          font-size: 0.875rem;
          color: #FAF8F5;
        }

        .info-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--accent-gold);
          text-decoration: none;
        }

        .inquiry-message-card {
          background: #141312;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .message-content {
          font-size: 0.9375rem;
          line-height: 1.7;
          color: #FAF8F5;
          white-space: pre-wrap;
        }

        .notes-area {
          background: #141312;
          border-color: rgba(255, 255, 255, 0.12);
          color: #FAF8F5;
          min-height: 90px;
        }

        .preview-wrap {
          width: 100%;
          aspect-ratio: 16 / 10;
          background: #141312;
          overflow: hidden;
        }

        .photo-preview-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .checkboxes-row {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          padding: 1rem 0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: #FAF8F5;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .admin-sidebar {
            width: 72px;
          }
          .brand-name, .brand-badge, .admin-info, .sidebar-footer span, .nav-btn span {
            display: none;
          }
          .sidebar-brand-box {
            padding: 1.5rem 0.75rem;
            align-items: center;
          }
          .admin-profile-pill {
            padding: 0;
            background: none;
            border: none;
          }
          .nav-btn {
            justify-content: center;
            padding: 0.85rem 0;
          }
          .dashboard-columns {
            grid-template-columns: 1fr;
          }
          .inquiry-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
