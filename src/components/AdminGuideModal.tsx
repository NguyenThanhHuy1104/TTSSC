import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Save,
  Layers,
  Image as ImageIcon,
  Video,
  Check,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  LogOut,
  SlidersHorizontal,
  RotateCcw,
  Search,
  BookOpen,
  FolderKanban
} from 'lucide-react';
import { Guide, GuideStep, Category } from '../types';
import {
  CATEGORY_MODULES,
  FEATURE_MODULES,
  saveHiddenModules,
  resetAllHiddenModules
} from '../services/moduleService';

interface AdminGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  guides: Guide[];
  categories: Category[];
  onSaveGuide: (guide: Guide) => void;
  onDeleteGuide: (id: string) => void;
  hiddenModules?: string[];
  onModulesChanged?: (newHidden: string[]) => void;
}

export const AdminGuideModal: React.FC<AdminGuideModalProps> = ({
  isOpen,
  onClose,
  guides,
  categories,
  onSaveGuide,
  onDeleteGuide,
  hiddenModules = [],
  onModulesChanged
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ssc_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Tab switching: 'guides' | 'modules'
  const [adminSection, setAdminSection] = useState<'guides' | 'modules'>('guides');
  const [moduleSearch, setModuleSearch] = useState<string>('');
  const [moduleTypeFilter, setModuleTypeFilter] = useState<'all' | 'category' | 'feature'>('all');

  const [editingGuide, setEditingGuide] = useState<Partial<Guide> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleToggleModule = (id: string) => {
    let updated: string[];
    if (hiddenModules.includes(id)) {
      updated = hiddenModules.filter((mId) => mId !== id);
    } else {
      updated = [...hiddenModules, id];
    }
    saveHiddenModules(updated);
    if (onModulesChanged) onModulesChanged(updated);
  };

  const handleShowAllModules = () => {
    resetAllHiddenModules();
    if (onModulesChanged) onModulesChanged([]);
  };

  const handleHideAllCategories = () => {
    const catIds = CATEGORY_MODULES.map((m) => m.id);
    const updated = Array.from(new Set([...hiddenModules, ...catIds]));
    saveHiddenModules(updated);
    if (onModulesChanged) onModulesChanged(updated);
  };

  if (!isOpen) return null;

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === 'ssc87333') {
      setIsAuthenticated(true);
      sessionStorage.setItem('ssc_admin_auth', 'true');
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError('Mật khẩu quản trị không chính xác. Vui lòng thử lại!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ssc_admin_auth');
    setPasswordInput('');
    setAuthError('');
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingGuide({
      id: `guide-${Date.now()}`,
      slug: `huong-dan-moi-${Date.now()}`,
      title: '',
      description: '',
      category: categories[0]?.name || 'Hệ thống',
      categoryId: categories[0]?.id || 'he-thong',
      featured: false,
      isNew: true,
      updatedAt: new Date().toISOString().split('T')[0],
      readingTime: 3,
      author: 'Bộ phận SSC Admin',
      steps: [
        {
          id: `step-1-${Date.now()}`,
          title: 'Bước 1: Khởi động quy trình',
          content: 'Mô tả nội dung hướng dẫn bước 1...'
        }
      ]
    });
  };

  const handleStartEdit = (guide: Guide) => {
    setIsCreating(false);
    setEditingGuide({ ...guide });
  };

  const handleAddStep = () => {
    if (!editingGuide) return;
    const currentSteps = editingGuide.steps || [];
    const newStep: GuideStep = {
      id: `step-${currentSteps.length + 1}-${Date.now()}`,
      title: `Bước ${currentSteps.length + 1}: Thao tác mới`,
      content: 'Nhập nội dung hướng dẫn...'
    };
    setEditingGuide({
      ...editingGuide,
      steps: [...currentSteps, newStep]
    });
  };

  const handleRemoveStep = (idx: number) => {
    if (!editingGuide) return;
    const currentSteps = [...(editingGuide.steps || [])];
    currentSteps.splice(idx, 1);
    setEditingGuide({
      ...editingGuide,
      steps: currentSteps
    });
  };

  const handleSave = () => {
    if (!editingGuide || !editingGuide.title) {
      alert('Vui lòng nhập tên bài hướng dẫn');
      return;
    }
    onSaveGuide(editingGuide as Guide);
    setEditingGuide(null);
    setIsCreating(false);
  };

  // If not authenticated, render the Password Verification Screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  XÁC THỰC QUẢN TRỊ
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cổng Quản lý & Biên tập Tài liệu
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Nhập Mật khẩu Quản trị
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="Nhập mật khẩu quản trị..."
                  autoFocus
                  className="w-full pl-9 pr-10 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-center tracking-widest text-lg font-black focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && (
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 animate-in fade-in">
                  {authError}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-extrabold text-sm bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>MỞ TRANG QUẢN TRỊ</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600 text-white font-bold text-xs">
              ADMIN
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Quản trị Cổng Tài liệu & Hướng dẫn
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thêm, sửa, xóa quy trình và tài liệu hỗ trợ nội bộ SSC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Khóa quản trị"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Khóa</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Sub-header Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70">
          <button
            type="button"
            onClick={() => {
              setAdminSection('guides');
              setEditingGuide(null);
            }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              adminSection === 'guides'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Quản lý Bài viết ({guides.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAdminSection('modules');
              setEditingGuide(null);
            }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              adminSection === 'modules'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Quản lý Ẩn / Hiện Module</span>
            {hiddenModules.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500 text-white font-bold">
                {hiddenModules.length} đang ẩn
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {adminSection === 'modules' ? (
            /* Module Management UI */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>DANH SÁCH MODULE HỆ THỐNG</span>
                    <span className="text-xs font-normal text-slate-500">
                      (Bật/tắt để ẩn hoặc hiện trên Menu & Trang chủ)
                    </span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShowAllModules}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Hiện tất cả module</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleHideAllCategories}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Ẩn toàn bộ danh mục</span>
                  </button>

                  {hiddenModules.length > 0 && (
                    <button
                      type="button"
                      onClick={handleShowAllModules}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Khôi phục mặc định</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setModuleTypeFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      moduleTypeFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Tất cả ({CATEGORY_MODULES.length + FEATURE_MODULES.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setModuleTypeFilter('category')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      moduleTypeFilter === 'category'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Nghiệp vụ ({CATEGORY_MODULES.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setModuleTypeFilter('feature')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      moduleTypeFilter === 'feature'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Tính năng ({FEATURE_MODULES.length})
                  </button>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                    placeholder="Tìm tên module..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Module List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {[...CATEGORY_MODULES, ...FEATURE_MODULES]
                  .filter((m) => {
                    if (moduleTypeFilter === 'category' && m.type !== 'category') return false;
                    if (moduleTypeFilter === 'feature' && m.type !== 'feature') return false;
                    if (moduleSearch.trim()) {
                      const q = moduleSearch.toLowerCase();
                      return m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
                    }
                    return true;
                  })
                  .map((mod) => {
                    const isHidden = hiddenModules.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isHidden
                            ? 'bg-slate-50 dark:bg-slate-950/60 border-dashed border-slate-300 dark:border-slate-800 opacity-65'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs hover:border-blue-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              mod.type === 'category'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            }`}>
                              {mod.type === 'category' ? 'Nghiệp vụ' : 'Tính năng'}
                            </span>

                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isHidden
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}>
                              {isHidden ? 'ĐÃ ẨN' : 'HIỂN THỊ'}
                            </span>
                          </div>

                          <h4 className={`text-sm font-bold truncate ${
                            isHidden ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {mod.name}
                          </h4>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {mod.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleModule(mod.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0 flex items-center gap-1.5 ${
                            isHidden
                              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {isHidden ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Hiện</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Ẩn</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : editingGuide ? (
            /* Guide Form Editor */
            <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  {isCreating ? 'Tạo bài hướng dẫn mới' : 'Chỉnh sửa bài hướng dẫn'}
                </h3>
                <button
                  onClick={() => setEditingGuide(null)}
                  className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Quay lại danh sách
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tiêu đề hướng dẫn *
                  </label>
                  <input
                    type="text"
                    value={editingGuide.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-');
                      setEditingGuide({ ...editingGuide, title, slug });
                    }}
                    placeholder="Nhập tiêu đề hướng dẫn..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Danh mục
                  </label>
                  <select
                    value={editingGuide.categoryId || categories[0]?.id}
                    onChange={(e) => {
                      const cat = categories.find((c) => c.id === e.target.value);
                      setEditingGuide({
                        ...editingGuide,
                        categoryId: e.target.value,
                        category: cat?.name || 'Hệ thống'
                      });
                    }}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mô tả tóm tắt
                </label>
                <textarea
                  rows={2}
                  value={editingGuide.description || ''}
                  onChange={(e) => setEditingGuide({ ...editingGuide, description: e.target.value })}
                  placeholder="Mô tả ngắn gọn mục đích bài viết..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Thời gian đọc (phút)
                  </label>
                  <input
                    type="number"
                    value={editingGuide.readingTime || 3}
                    onChange={(e) => setEditingGuide({ ...editingGuide, readingTime: parseInt(e.target.value) || 3 })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Người phụ trách
                  </label>
                  <input
                    type="text"
                    value={editingGuide.author || 'Bộ phận SSC'}
                    onChange={(e) => setEditingGuide({ ...editingGuide, author: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center gap-4 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={editingGuide.featured || false}
                      onChange={(e) => setEditingGuide({ ...editingGuide, featured: e.target.checked })}
                      className="rounded-md w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Nổi bật (Featured)</span>
                  </label>
                </div>
              </div>

              {/* Steps Editor */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    DANH SÁCH BƯỚC HƯỚNG DẪN ({editingGuide.steps?.length || 0})
                  </h4>
                  <button
                    onClick={handleAddStep}
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm bước mới
                  </button>
                </div>

                <div className="space-y-4">
                  {(editingGuide.steps || []).map((step, sIdx) => (
                    <div
                      key={step.id || sIdx}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                          BƯỚC {sIdx + 1}
                        </span>
                        {editingGuide.steps!.length > 1 && (
                          <button
                            onClick={() => handleRemoveStep(sIdx)}
                            className="p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => {
                          const steps = [...editingGuide.steps!];
                          steps[sIdx].title = e.target.value;
                          setEditingGuide({ ...editingGuide, steps });
                        }}
                        placeholder="Tiêu đề bước..."
                        className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />

                      <textarea
                        rows={2}
                        value={step.content}
                        onChange={(e) => {
                          const steps = [...editingGuide.steps!];
                          steps[sIdx].content = e.target.value;
                          setEditingGuide({ ...editingGuide, steps });
                        }}
                        placeholder="Nội dung chi tiết..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Controls */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setEditingGuide(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                >
                  <Save className="w-4 h-4" /> Lưu bài viết
                </button>
              </div>
            </div>
          ) : (
            /* Guide List */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  TẤT CẢ BÀI HƯỚNG DẪN ({guides.length})
                </h3>
                <button
                  onClick={handleStartCreate}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm bài hướng dẫn mới
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {guides.map((g) => (
                  <div
                    key={g.id}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {g.category}
                        </span>
                        {g.featured && (
                          <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-amber-500 text-white">
                            NỔI BẬT
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {g.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {g.steps.length} bước • Cập nhật {g.updatedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleStartEdit(g)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa "${g.title}"?`)) {
                            onDeleteGuide(g.id);
                          }
                        }}
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
