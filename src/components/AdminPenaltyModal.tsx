import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Save,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldAlert,
  LogOut,
  UserCheck,
  UserX,
  Tag,
  CheckCircle2,
  Copy,
  FileSpreadsheet,
  AlertCircle,
  RotateCcw,
  Search
} from 'lucide-react';
import { PenaltyRuleItem } from '../types';
import {
  getCustomPenalties,
  saveCustomPenalty,
  deleteCustomPenalty,
  exportPenaltiesToTSV
} from '../services/penaltyService';

interface AdminPenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingItems: PenaltyRuleItem[];
  onDataChanged: () => void;
  initialEditingItem?: PenaltyRuleItem | null;
}

export const AdminPenaltyModal: React.FC<AdminPenaltyModalProps> = ({
  isOpen,
  onClose,
  existingItems,
  onDataChanged,
  initialEditingItem
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ssc_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Active Tab: 'form' | 'list'
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  // Custom Items list
  const [customList, setCustomList] = useState<PenaltyRuleItem[]>([]);
  const [filterKeyword, setFilterKeyword] = useState<string>('');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState<string>('');
  const [officialPenalty, setOfficialPenalty] = useState<string>('');
  const [probationPenalty, setProbationPenalty] = useState<string>('');
  const [columnA, setColumnA] = useState<string>('Quy định nội bộ chung');
  const [columnB, setColumnB] = useState<string>('Nội quy kỷ luật');
  const [columnC, setColumnC] = useState<string>('Quy chuẩn thực thi');
  const [description, setDescription] = useState<string>('');
  const [columnF, setColumnF] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');

  // Toast / Status inside modal
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Available unique groups for dropdown suggestion
  const existingGroupsA = Array.from(new Set(existingItems.map((i) => i.columnA).filter(Boolean)));
  const existingGroupsB = Array.from(new Set(existingItems.map((i) => i.columnB).filter(Boolean)));

  // Load custom items on open
  useEffect(() => {
    if (isOpen) {
      const items = getCustomPenalties();
      setCustomList(items);

      if (initialEditingItem) {
        loadItemIntoForm(initialEditingItem);
        setActiveTab('form');
      }
    }
  }, [isOpen, initialEditingItem]);

  const loadItemIntoForm = (item: PenaltyRuleItem) => {
    setEditingId(item.id);
    setKeyword(item.keyword || '');
    setOfficialPenalty(item.officialEmployeePenalty || '');
    setProbationPenalty(item.probationEmployeePenalty || '');
    setColumnA(item.columnA || 'Quy định nội bộ chung');
    setColumnB(item.columnB || 'Nội quy kỷ luật');
    setColumnC(item.columnC || 'Quy chuẩn thực thi');
    setDescription(item.description || '');
    setColumnF(item.columnF || '');
    setTagsInput((item.customKeywords || []).join(', '));
    setStatusMsg(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setKeyword('');
    setOfficialPenalty('');
    setProbationPenalty('');
    setColumnA('Quy định nội bộ chung');
    setColumnB('Nội quy kỷ luật');
    setColumnC('Quy chuẩn thực thi');
    setDescription('');
    setColumnF('');
    setTagsInput('');
    setStatusMsg(null);
  };

  if (!isOpen) return null;

  // Handle Admin Password Verification
  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === 'ssc87333') {
      setIsAuthenticated(true);
      sessionStorage.setItem('ssc_admin_auth', 'true');
      setAuthError('');
      setPasswordInput('');
    } else {
      const errorMsg = initialEditingItem?.id || editingId
        ? `Mật khẩu không chính xác cho lỗi [Mã #${initialEditingItem?.id || editingId}]. Vui lòng thử lại!`
        : 'Mật khẩu quản trị không chính xác. Vui lòng thử lại!';
      setAuthError(errorMsg);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ssc_admin_auth');
    setPasswordInput('');
    setAuthError('');
  };

  // Handle Save / Add Keyword
  const handleSaveKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKeyword = keyword.trim();
    if (!cleanKeyword) {
      setStatusMsg({ type: 'error', text: 'Vui lòng nhập Nội dung vi phạm / Keyword chính!' });
      return;
    }

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const targetId = editingId || `custom-${Date.now()}`;
    const newPenaltyItem: PenaltyRuleItem = {
      id: targetId,
      columnA: columnA.trim() || 'Quy định chung',
      columnB: columnB.trim() || 'Kỷ luật lao động',
      columnC: columnC.trim() || 'Phân loại',
      keyword: cleanKeyword,
      description: description.trim() || 'Chưa có thông tin',
      columnF: columnF.trim(),
      officialEmployeePenalty: officialPenalty.trim() || 'Chưa có thông tin',
      probationEmployeePenalty: probationPenalty.trim() || 'Chưa có thông tin',
      isCustom: true,
      customKeywords: parsedTags
    };

    const updated = saveCustomPenalty(newPenaltyItem);
    setCustomList(updated);
    setStatusMsg({
      type: 'success',
      text: editingId ? 'Đã cập nhật Keyword vi phạm thành công!' : 'Đã thêm Keyword vi phạm mới thành công!'
    });

    onDataChanged();

    if (!editingId) {
      resetForm();
    }
  };

  // Handle Delete Keyword
  const handleDelete = (id: string, kw: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa Keyword vi phạm "${kw}" không?`)) {
      const updated = deleteCustomPenalty(id);
      setCustomList(updated);
      if (editingId === id) {
        resetForm();
      }
      onDataChanged();
      setStatusMsg({ type: 'success', text: `Đã xóa keyword "${kw}"!` });
    }
  };

  // Copy as TSV for Google Sheets
  const handleCopyTSV = () => {
    if (customList.length === 0) {
      alert('Chưa có keyword tùy chỉnh nào để xuất.');
      return;
    }
    const tsv = exportPenaltiesToTSV(customList);
    navigator.clipboard.writeText(tsv).then(() => {
      alert('Đã sao chép định dạng bảng tính! Bạn có thể dán (Ctrl+V) trực tiếp vào Google Sheet.');
    });
  };

  const filteredCustomList = customList.filter((it) => {
    if (!filterKeyword.trim()) return true;
    const q = filterKeyword.toLowerCase();
    return (
      it.keyword.toLowerCase().includes(q) ||
      (it.customKeywords || []).some((k) => k.toLowerCase().includes(q)) ||
      (it.columnA || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>QUẢN TRỊ VIÊN: THÊM & QUẢN LÝ KEYWORD VI PHẠM</span>
              </h2>
              <p className="text-xs text-slate-300">
                Thêm nội dung vi phạm, từ khóa tra cứu và 2 mức xử lý lao động
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
                title="Đăng xuất quyền Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            )}
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* Authentication Screen */
          <div className="p-8 max-w-md mx-auto my-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Xác thực quyền Quản trị (Admin)
              </h3>
              {initialEditingItem ? (
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 text-left space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded font-mono font-black text-[11px] bg-red-600 text-white">
                      Mã lỗi: #{initialEditingItem.id}
                    </span>
                    <span className="text-[11px] font-bold text-orange-800 dark:text-orange-300">
                      Yêu cầu mật khẩu để sửa quy định
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                    {initialEditingItem.keyword}
                  </p>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Vui lòng nhập mật khẩu quản trị viên để có quyền thêm, chỉnh sửa hoặc quản lý từ khóa vi phạm.
                </p>
              )}
            </div>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="Nhập mật khẩu quản trị..."
                  className="w-full px-4 py-3 pl-10 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer"
              >
                Mở khóa bảng Quản trị
              </button>
            </form>
          </div>
        ) : (
          /* Main Admin Workspace */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Tabs Header */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('form')}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'form'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingId ? 'Chỉnh sửa Keyword' : '➕ Thêm Keyword mới'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('list')}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'list'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>Danh sách đã tạo ({customList.length})</span>
                </button>
              </div>

              {activeTab === 'list' && customList.length > 0 && (
                <button
                  onClick={handleCopyTSV}
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
                  title="Sao chép toàn bộ định dạng bảng tính để dán vào Google Sheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Copy cho Google Sheet</span>
                </button>
              )}
            </div>

            {/* Notification alert inside modal */}
            {statusMsg && (
              <div
                className={`mx-6 mt-3 p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {statusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{statusMsg.text}</span>
                </div>
                <button
                  onClick={() => setStatusMsg(null)}
                  type="button"
                  className="p-1 hover:bg-black/10 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tab 1: Form Thêm / Sửa Keyword */}
            {activeTab === 'form' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <form onSubmit={handleSaveKeyword} className="space-y-5">
                  {/* 1. NỘI DUNG VI PHẠM (PANEL MÀU ĐỎ CAM) */}
                  <div className="rounded-xl border-2 border-orange-300 dark:border-orange-900/70 bg-gradient-to-br from-orange-50/90 via-amber-50/60 to-red-50/80 dark:from-orange-950/40 dark:via-amber-950/20 dark:to-red-950/30 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-extrabold text-orange-900 dark:text-orange-300 uppercase tracking-wide flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <span>1. NỘI DUNG VI PHẠM / KEYWORD CHÍNH (BẮT BUỘC - CỘT D)</span>
                      </label>
                      {editingId && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                          Đang sửa: {editingId}
                        </span>
                      )}
                    </div>
                    <textarea
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Ví dụ: Đi làm muộn quá 15 phút không xin phép, Không đeo thẻ nhân viên trong ca làm việc, Chấm công hộ đồng nghiệp..."
                      rows={3}
                      className="w-full p-3 rounded-xl border border-orange-300 dark:border-orange-800/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  {/* TỪ KHÓA TÌM KIẾM PHỤ (TAGS / ALIASES) */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 space-y-2">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-500" />
                      <span>Từ khóa tìm kiếm phụ / Từ đồng nghĩa (Cách nhau bằng dấu phẩy)</span>
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="Ví dụ: đi trễ, muộn giờ, thẻ nv, quên thẻ, quẹt vân tay hộ..."
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      💡 Giúp người dùng khi gõ các từ đồng nghĩa ngắn gọn trên thanh tìm kiếm đều tra ra được quy định này.
                    </p>
                  </div>

                  {/* 2 & 3. HAI MỨC XỬ LÝ VI PHẠM: CHÍNH THỨC & THỬ VIỆC */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Official Employee */}
                    <div className="p-4 rounded-xl border-2 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 space-y-2">
                      <label className="text-xs font-extrabold text-blue-900 dark:text-blue-300 uppercase flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <span>2. Mức xử lý đối với NV ký HĐ chính thức (Cột G)</span>
                      </label>
                      <textarea
                        value={officialPenalty}
                        onChange={(e) => setOfficialPenalty(e.target.value)}
                        placeholder="Ví dụ: Lần 1: Nhắc nhở bằng văn bản&#10;Lần 2: Trừ 100.000đ vào thưởng chuyên cần&#10;Lần 3: Khiển trách toàn công ty..."
                        rows={4}
                        className="w-full p-2.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Probation Employee */}
                    <div className="p-4 rounded-xl border-2 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30 space-y-2">
                      <label className="text-xs font-extrabold text-amber-900 dark:text-amber-300 uppercase flex items-center gap-1.5">
                        <UserX className="w-4 h-4 text-amber-600" />
                        <span>3. Mức xử lý đối với NV thử việc (Cột H)</span>
                      </label>
                      <textarea
                        value={probationPenalty}
                        onChange={(e) => setProbationPenalty(e.target.value)}
                        placeholder="Ví dụ: Lần 1: Nhắc nhở trực tiếp&#10;Lần 2: Đánh giá không đạt thử việc..."
                        rows={4}
                        className="w-full p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* PHÂN LOẠI NHÓM (CỘT A, B, C) */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 space-y-3">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                      📁 Phân loại phân nhóm (Cột A, B, C)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Cột A: Nhóm lớn
                        </label>
                        <input
                          type="text"
                          value={columnA}
                          onChange={(e) => setColumnA(e.target.value)}
                          placeholder="Ví dụ: Thời giờ làm việc..."
                          list="groupA-list"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-medium"
                        />
                        <datalist id="groupA-list">
                          {existingGroupsA.map((g) => (
                            <option key={g} value={g} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Cột B: Nhóm nhỏ
                        </label>
                        <input
                          type="text"
                          value={columnB}
                          onChange={(e) => setColumnB(e.target.value)}
                          placeholder="Ví dụ: Chấm công & Tác phong..."
                          list="groupB-list"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-medium"
                        />
                        <datalist id="groupB-list">
                          {existingGroupsB.map((g) => (
                            <option key={g} value={g} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Cột C: Phân loại / Mã
                        </label>
                        <input
                          type="text"
                          value={columnC}
                          onChange={(e) => setColumnC(e.target.value)}
                          placeholder="Ví dụ: Vi phạm chung..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Button */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Làm mới Form</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Đóng
                      </button>

                      <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingId ? 'Lưu thay đổi Keyword' : '➕ Thêm Keyword vi phạm'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 2: Danh sách Keyword đã tạo */}
            {activeTab === 'list' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={filterKeyword}
                      onChange={(e) => setFilterKeyword(e.target.value)}
                      placeholder="Tìm trong danh sách keyword đã tạo..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>

                  <button
                    onClick={() => {
                      resetForm();
                      setActiveTab('form');
                    }}
                    type="button"
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Keyword mới</span>
                  </button>
                </div>

                {filteredCustomList.length === 0 ? (
                  <div className="text-center py-12 space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center mx-auto">
                      <Tag className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      {customList.length === 0
                        ? 'Chưa có keyword vi phạm tùy chỉnh nào được thêm bởi Admin.'
                        : 'Không tìm thấy keyword phù hợp với bộ lọc.'}
                    </p>
                    {customList.length === 0 && (
                      <button
                        onClick={() => setActiveTab('form')}
                        type="button"
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500"
                      >
                        Bấm để tạo Keyword đầu tiên
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCustomList.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                              <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                                Admin Thêm
                              </span>
                              <span>{item.columnA}</span>
                              <span>&gt;</span>
                              <span>{item.columnB}</span>
                            </div>
                            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 whitespace-pre-line">
                              {item.keyword}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                loadItemIntoForm(item);
                                setActiveTab('form');
                              }}
                              type="button"
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                              title="Chỉnh sửa keyword này"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.keyword)}
                              type="button"
                              className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Xóa keyword này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Aliases Tags */}
                        {item.customKeywords && item.customKeywords.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[11px] text-slate-400 font-bold mr-1">Tags:</span>
                            {item.customKeywords.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Penalties Preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-700/60">
                          <div className="p-2 rounded bg-blue-50/50 dark:bg-blue-950/20 text-slate-800 dark:text-slate-300">
                            <span className="font-bold text-blue-700 dark:text-blue-400 block mb-0.5">
                              NV Chính thức:
                            </span>
                            <span className="line-clamp-2">{item.officialEmployeePenalty || 'Chưa có'}</span>
                          </div>
                          <div className="p-2 rounded bg-amber-50/50 dark:bg-amber-950/20 text-slate-800 dark:text-slate-300">
                            <span className="font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                              NV Thử việc:
                            </span>
                            <span className="line-clamp-2">{item.probationEmployeePenalty || 'Chưa có'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
