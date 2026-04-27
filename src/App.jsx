import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════════
// ⚠️ 여기 2줄만 수정하세요!
// Supabase 프로젝트 설정 > API Keys 메뉴에서 복사해서 붙여넣기
// ═══════════════════════════════════════════════════════════
const SUPABASE_URL = "https://lrtqrngbgzkkxnypouvj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__lSnba-jeLmVzjrB24D1gA_ByhunaT5";
// ═══════════════════════════════════════════════════════════

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CHANNELS = ["직영몰", "홈쇼핑", "해외", "브스", "올리브영", "카카오", "쿠팡", "공구", "제로샵", "기타"];

const COLORS = {
  bg: "#FAFAF7",
  panel: "#fff",
  border: "#EBE8DE",
  borderInput: "#D0D0C9",
  text: "#1a1a1a",
  textMuted: "#666",
  textHint: "#888",
  textLight: "#BBB5A0",
  accent: "#DB5C4A",
  accentBg: "#FEF3F0",
  accentText: "#8B2817",
  warn: "#BA7517",
  warnBg: "#FDF8E8",
  warnText: "#5C4A1A",
  success: "#1f5a2c",
  surface: "#F5F2EA",
};

export default function App() {
  const [rules, setRules] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [rulesRes, histRes] = await Promise.all([
      supabase.from("cs_rules").select("*").order("created_at", { ascending: false }),
      supabase.from("cs_reviews").select("*").order("created_at", { ascending: false }).limit(10),
    ]);
    if (rulesRes.data) setRules(rulesRes.data);
    if (histRes.data) setHistory(histRes.data);
    setLoading(false);
  };

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  }, []);

  if (loading) {
    return (
      <div style={{minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, -apple-system, sans-serif", color: COLORS.text}}>
        불러오는 중…
      </div>
    );
  }

  return (
    <div style={{minHeight: "100vh", background: COLORS.bg, fontFamily: "'Pretendard', 'Inter', -apple-system, sans-serif", color: COLORS.text}}>
      <GlobalStyles/>
      <Header onShowRules={() => setShowRulesModal(true)} ruleCount={rules.length}/>
      <main style={{maxWidth: 1400, margin: "0 auto", padding: "24px 28px 80px"}}>
        <ReviewForm rules={rules} reload={loadData} showToast={showToast}/>
        <HistorySection history={history}/>
      </main>
      {showRulesModal && (
        <RulesModal rules={rules} reload={loadData} showToast={showToast} onClose={() => setShowRulesModal(false)}/>
      )}
      {toast && <Toast {...toast}/>}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// 글로벌 스타일
// ───────────────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css');
      * { box-sizing: border-box; }
      body { margin: 0; }
      input, textarea, select, button { font-family: inherit; }
      input:focus, textarea:focus, select:focus { outline: none; border-color: ${COLORS.text}; }
      .btn { padding: 8px 14px; font-size: 12px; border-radius: 6px; cursor: pointer; border: none; font-weight: 500; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
      .btn-dark { background: ${COLORS.text}; color: #fff; }
      .btn-dark:hover { background: ${COLORS.accent}; }
      .btn-light { background: #fff; color: ${COLORS.text}; border: 0.5px solid ${COLORS.borderInput}; }
      .btn-light:hover { background: ${COLORS.surface}; }
      .form-input { width: 100%; padding: 8px 11px; font-size: 13px; border: 0.5px solid ${COLORS.borderInput}; border-radius: 5px; background: #fff; box-sizing: border-box; }
      .form-textarea { min-height: 60px; resize: vertical; line-height: 1.5; }
      .form-label { font-size: 11px; color: ${COLORS.textHint}; margin-bottom: 4px; display: block; font-weight: 500; }
      @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
      @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    `}</style>
  );
}

// ───────────────────────────────────────────────────────────
// 헤더
// ───────────────────────────────────────────────────────────
function Header({ onShowRules, ruleCount }) {
  return (
    <header style={{background: COLORS.panel, padding: "18px 28px", borderBottom: `0.5px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
      <div>
        <div style={{fontSize: 18, fontWeight: 600, letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: 8}}>
          <span style={{width: 8, height: 8, background: COLORS.accent, borderRadius: "50%"}}/>
          CS 이미지 검수
        </div>
        <div style={{fontSize: 11, color: COLORS.textHint, letterSpacing: "1px", marginTop: 4}}>
          CS IMAGE REVIEW · 채널별 검수 도구
        </div>
      </div>
      <button className="btn btn-light" onClick={onShowRules}>
        📋 규칙 목록 보기 · {ruleCount}건
      </button>
    </header>
  );
}

// ───────────────────────────────────────────────────────────
// 메인 검수 폼
// ───────────────────────────────────────────────────────────
function ReviewForm({ rules, reload, showToast }) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [channel, setChannel] = useState("직영몰");
  const [product, setProduct] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [tesseractReady, setTesseractReady] = useState(false);
  const [manualIssues, setManualIssues] = useState([{ problem: "", suggestion: "", saveAsRule: true }]);
  const fileInputRef = useRef();

  // Tesseract.js 로드
  useEffect(() => {
    if (window.Tesseract) { setTesseractReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    s.onload = () => setTesseractReady(true);
    document.body.appendChild(s);
  }, []);

  // 자동 감지
  const autoDetections = useMemo(() => {
    if (!ocrText.trim()) return [];
    const matches = [];
    rules.forEach(rule => {
      if (!rule.is_common && !rule.channels?.includes(channel)) return;
      const lower = ocrText.toLowerCase();
      const term = rule.problem.toLowerCase();
      if (lower.includes(term)) {
        matches.push(rule);
      }
    });
    return matches;
  }, [ocrText, rules, channel]);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      showToast("이미지 파일만 업로드 가능해요", "error"); return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      const img = new Image();
      img.onload = () => {
        setImageInfo({ name: file.name, size: (file.size/1024).toFixed(0), w: img.width, h: img.height });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    setOcrText("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const runOCR = async () => {
    if (!imageFile || !window.Tesseract) return;
    setOcrLoading(true); setOcrProgress(0);
    try {
      const { data } = await window.Tesseract.recognize(imageFile, "kor+eng", {
        logger: (m) => { if (m.status === "recognizing text") setOcrProgress(Math.round(m.progress * 100)); }
      });
      setOcrText(data.text.trim());
      showToast("텍스트 추출 완료");
    } catch (err) {
      showToast("OCR 실패: " + err.message, "error");
    } finally { setOcrLoading(false); }
  };

  const updateIssue = (i, field, val) => {
    const next = [...manualIssues];
    next[i] = { ...next[i], [field]: val };
    setManualIssues(next);
  };

  const addIssue = () => setManualIssues([...manualIssues, { problem: "", suggestion: "", saveAsRule: true }]);
  const removeIssue = (i) => setManualIssues(manualIssues.filter((_, idx) => idx !== i));

  const handleReset = () => {
    setImageFile(null); setImagePreview(null); setImageInfo(null);
    setOcrText(""); setProduct(""); setReviewer("");
    setManualIssues([{ problem: "", suggestion: "", saveAsRule: true }]);
  };

  const handleSave = async () => {
    if (!imagePreview) { showToast("이미지를 먼저 업로드해주세요", "error"); return; }
    if (!ocrText.trim()) { showToast("텍스트 추출 후 저장해주세요", "error"); return; }

    const validIssues = manualIssues.filter(i => i.problem.trim());
    
    // 1) 검수 이력 저장
    const totalIssues = autoDetections.length + validIssues.length;
    const { error } = await supabase.from("cs_reviews").insert({
      reviewer: reviewer.trim() || "미기명",
      channel,
      product: product.trim() || "-",
      ocr_text: ocrText,
      auto_detections: autoDetections.map(d => ({ problem: d.problem, suggestion: d.suggestion })),
      manual_issues: validIssues.map(i => ({ problem: i.problem, suggestion: i.suggestion })),
      total_issue_count: totalIssues,
      status: totalIssues === 0 ? "통과" : "수정필요",
      thumbnail: imagePreview.slice(0, 50000),
    });
    if (error) { showToast("저장 실패: " + error.message, "error"); return; }

    // 2) "규칙 DB에 저장" 체크된 항목들을 규칙으로 등록
    const newRules = validIssues
      .filter(i => i.saveAsRule && i.problem.trim() && i.suggestion.trim())
      .map(i => ({
        problem: i.problem.trim(),
        suggestion: i.suggestion.trim(),
        channels: [channel],
        is_common: false,
        created_by: reviewer.trim() || "미기명",
      }));
    if (newRules.length > 0) {
      await supabase.from("cs_rules").insert(newRules);
    }

    await reload();
    showToast(`검수 결과 저장 완료${newRules.length > 0 ? ` (규칙 ${newRules.length}건 추가)` : ""}`);
    handleReset();
  };

  return (
    <div>
      {/* 안내 배너 */}
      <div style={{background: COLORS.warnBg, borderLeft: `3px solid ${COLORS.warn}`, padding: "10px 14px", borderRadius: "0 5px 5px 0", fontSize: 12, color: COLORS.warnText, marginBottom: 16, lineHeight: 1.6}}>
        OCR이 자동 감지하는 건 텍스트 표현뿐이에요. 이미지 속 제품 개수, 그래픽 요소 등은 직접 확인하고 코멘트로 남겨주세요. 작성한 내용은 규칙 DB에 저장해서 다음부터 자동 감지하도록 학습시킬 수 있어요.
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16}}>
        {/* 좌측: 이미지 & 정보 */}
        <Panel step="1" title="이미지 업로드 & 정보">
          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              style={{border: "1.5px dashed #C7B8A0", borderRadius: 8, padding: "40px 20px", textAlign: "center", background: COLORS.bg, cursor: "pointer", marginBottom: 12}}
            >
              <div style={{width: 36, height: 36, margin: "0 auto 10px", background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: `0.5px solid ${COLORS.borderInput}`}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.textHint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div style={{fontSize: 13, color: "#444", fontWeight: 500, marginBottom: 3}}>이미지를 드래그하거나 클릭해서 업로드</div>
              <div style={{fontSize: 11, color: "#999"}}>JPG, PNG, WEBP · 최대 10MB</div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} style={{display: "none"}}/>
            </div>
          ) : (
            <div style={{position: "relative", background: COLORS.bg, borderRadius: 8, padding: 8, marginBottom: 12}}>
              <img src={imagePreview} alt="업로드된 이미지" style={{width: "100%", maxHeight: 240, objectFit: "contain", borderRadius: 5, display: "block"}}/>
              <button onClick={handleReset} style={{position: "absolute", top: 14, right: 14, background: "rgba(26,26,26,0.85)", color: "#fff", border: "none", padding: "4px 9px", fontSize: 11, cursor: "pointer", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 4}}>
                ✕ 제거
              </button>
              {imageInfo && (
                <div style={{marginTop: 8, fontSize: 11, color: COLORS.textHint, display: "flex", justifyContent: "space-between", padding: "0 4px"}}>
                  <span style={{fontWeight: 500, color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%"}}>{imageInfo.name}</span>
                  <span>{imageInfo.w}×{imageInfo.h} · {imageInfo.size}KB</span>
                </div>
              )}
              {imageFile && !ocrText && (
                <div style={{marginTop: 10}}>
                  <button className="btn btn-dark" onClick={runOCR} disabled={ocrLoading || !tesseractReady} style={{width: "100%", justifyContent: "center", opacity: (ocrLoading || !tesseractReady) ? 0.6 : 1}}>
                    {ocrLoading ? `텍스트 추출 중… ${ocrProgress}%` : !tesseractReady ? "엔진 로딩 중…" : "텍스트 추출 시작"}
                  </button>
                </div>
              )}
            </div>
          )}

          <label className="form-label">채널</label>
          <div style={{display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5, marginBottom: 12}}>
            {CHANNELS.map(ch => (
              <button
                key={ch}
                onClick={() => setChannel(ch)}
                style={{
                  padding: "7px 4px", fontSize: 11, borderRadius: 5,
                  background: channel === ch ? COLORS.text : "#fff",
                  border: `0.5px solid ${channel === ch ? COLORS.text : COLORS.borderInput}`,
                  color: channel === ch ? "#fff" : "#555",
                  cursor: "pointer", textAlign: "center"
                }}
              >{ch}</button>
            ))}
          </div>

          <label className="form-label">제품명 / 캠페인명</label>
          <input className="form-input" value={product} onChange={e => setProduct(e.target.value)} placeholder="예: 이지듀 기미앰플 3일 특가"/>

          <label className="form-label" style={{marginTop: 10}}>검수자</label>
          <input className="form-input" value={reviewer} onChange={e => setReviewer(e.target.value)} placeholder="이름"/>
        </Panel>

        {/* 우측: 검수 작성 */}
        <Panel step="2" title="검수 내용 작성">
          {!ocrText ? (
            <div style={{padding: "30px 20px", textAlign: "center", background: COLORS.bg, borderRadius: 6, color: COLORS.textHint, fontSize: 12, minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center"}}>
              {imageFile ? "이미지를 분석하면 결과가 여기에 표시돼요" : "이미지를 업로드하고 분석을 시작해주세요"}
            </div>
          ) : (
            <>
              <div style={{display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: COLORS.textHint, marginBottom: 4}}>
                <span style={{background: "#FDF5E1", color: "#8F6F22", fontSize: 10, padding: "1px 7px", borderRadius: 8}}>자동 추출</span>
                <span>OCR로 텍스트 추출됨 · 수정 가능</span>
              </div>
              <textarea
                className="form-input form-textarea"
                value={ocrText}
                onChange={e => setOcrText(e.target.value)}
                style={{background: COLORS.surface, fontSize: 12.5, lineHeight: 1.6, marginBottom: 8, minHeight: 70}}
              />

              {autoDetections.length > 0 && (
                <div style={{marginBottom: 10}}>
                  {autoDetections.map((d, i) => (
                    <div key={i} style={{background: COLORS.accentBg, borderLeft: `3px solid ${COLORS.accent}`, padding: "10px 12px", borderRadius: "0 5px 5px 0", marginBottom: 6, fontSize: 12}}>
                      <p style={{color: COLORS.accentText, fontWeight: 500, margin: "0 0 3px"}}>⚠ 자동 감지: "{d.problem}" {d.is_common ? "(공통 규칙)" : `(${channel} 규칙)`}</p>
                      <p style={{color: "#5a4a44", margin: 0}}>규칙 DB와 매칭 · 수정 제안: "{d.suggestion}"</p>
                    </div>
                  ))}
                </div>
              )}

              <label className="form-label" style={{marginTop: 12}}>
                검수자가 추가로 발견한 문제 <span style={{color: COLORS.textLight, fontWeight: 400}}>(이미지 요소 등)</span>
              </label>
              {manualIssues.map((issue, i) => (
                <div key={i} style={{background: COLORS.bg, border: `0.5px solid ${COLORS.border}`, borderRadius: 5, padding: "10px 12px", marginBottom: 8}}>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6}}>
                    <span style={{fontSize: 11, fontWeight: 500, color: "#555"}}>문제점 {i+1}</span>
                    <div style={{display: "flex", alignItems: "center", gap: 8}}>
                      <label style={{fontSize: 10, color: COLORS.textHint, display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer"}}>
                        <input type="checkbox" checked={issue.saveAsRule} onChange={e => updateIssue(i, "saveAsRule", e.target.checked)} style={{width: 11, height: 11}}/>
                        규칙 DB에 저장
                      </label>
                      {manualIssues.length > 1 && (
                        <button onClick={() => removeIssue(i)} style={{background: "transparent", border: "none", color: COLORS.textHint, cursor: "pointer", fontSize: 14, padding: 0}}>✕</button>
                      )}
                    </div>
                  </div>
                  <textarea
                    className="form-input form-textarea"
                    value={issue.problem}
                    onChange={e => updateIssue(i, "problem", e.target.value)}
                    placeholder="발견한 문제를 구체적으로 작성해주세요"
                    style={{minHeight: 50}}
                  />
                  <label className="form-label" style={{margin: "8px 0 4px"}}>수정 제안</label>
                  <input
                    className="form-input"
                    value={issue.suggestion}
                    onChange={e => updateIssue(i, "suggestion", e.target.value)}
                    placeholder="대체 표현 또는 수정 방향"
                  />
                </div>
              ))}
              <button onClick={addIssue} style={{width: "100%", padding: 8, fontSize: 12, background: "transparent", border: `1px dashed ${COLORS.textLight}`, color: COLORS.textHint, borderRadius: 5, cursor: "pointer", marginTop: 4}}>
                + 문제점 추가
              </button>

              <div style={{display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: `0.5px solid ${COLORS.border}`}}>
                <button className="btn btn-dark" onClick={handleSave} style={{flex: 1, justifyContent: "center", padding: "10px"}}>
                  검수 결과 저장
                </button>
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// 패널 (공통 카드)
// ───────────────────────────────────────────────────────────
function Panel({ step, title, children }) {
  return (
    <div style={{background: COLORS.panel, border: `0.5px solid ${COLORS.border}`, borderRadius: 10, padding: 16}}>
      <div style={{fontSize: 11, fontWeight: 500, color: COLORS.textHint, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 6}}>
        <span style={{background: COLORS.text, color: "#fff", width: 16, height: 16, borderRadius: "50%", fontSize: 10, display: "inline-flex", alignItems: "center", justifyContent: "center"}}>{step}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// 검수 이력 섹션
// ───────────────────────────────────────────────────────────
function HistorySection({ history }) {
  const formatTime = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "방금 전";
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h/24)}일 전`;
  };

  if (history.length === 0) {
    return (
      <div style={{marginTop: 24}}>
        <p style={{fontSize: 14, fontWeight: 500, color: COLORS.text, margin: "0 0 12px"}}>최근 검수 이력</p>
        <div style={{background: COLORS.panel, border: `0.5px solid ${COLORS.border}`, borderRadius: 10, padding: 30, textAlign: "center", color: COLORS.textLight, fontSize: 13}}>
          아직 검수 이력이 없습니다
        </div>
      </div>
    );
  }

  return (
    <div style={{marginTop: 24}}>
      <p style={{fontSize: 14, fontWeight: 500, margin: "0 0 12px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        최근 검수 이력
        <span style={{fontSize: 11, color: COLORS.textHint, fontWeight: 400}}>최근 {history.length}건</span>
      </p>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8}}>
        {history.map(h => (
          <div key={h.id} style={{background: COLORS.panel, border: `0.5px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 12px", display: "grid", gridTemplateColumns: "44px 1fr", gap: 12, alignItems: "center"}}>
            <div style={{width: 44, height: 44, background: h.thumbnail || COLORS.surface, backgroundSize: "cover", backgroundPosition: "center", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center"}}>
              {h.thumbnail && h.thumbnail.startsWith("data:image") ? (
                <img src={h.thumbnail} alt="" style={{width: "100%", height: "100%", objectFit: "cover", borderRadius: 5}}/>
              ) : (
                <span style={{fontSize: 16}}>📄</span>
              )}
            </div>
            <div style={{minWidth: 0}}>
              <p style={{fontSize: 12, fontWeight: 500, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{h.product || "-"}</p>
              <div style={{fontSize: 10, color: COLORS.textHint, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap"}}>
                <span>{h.reviewer}</span>
                <span style={{width: 2, height: 2, background: COLORS.textLight, borderRadius: "50%"}}/>
                <span>{formatTime(h.created_at)}</span>
                <span style={{width: 2, height: 2, background: COLORS.textLight, borderRadius: "50%"}}/>
                <span style={{background: "#F1EFE8", color: "#444", padding: "1px 5px", borderRadius: 6, fontSize: 9}}>{h.channel}</span>
                <span style={{width: 2, height: 2, background: COLORS.textLight, borderRadius: "50%"}}/>
                <span style={{color: h.total_issue_count > 0 ? COLORS.accentText : COLORS.success, fontWeight: 500}}>
                  {h.total_issue_count > 0 ? `⚠ ${h.total_issue_count}건` : "✓ 통과"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// 규칙 목록 모달
// ───────────────────────────────────────────────────────────
function RulesModal({ rules, reload, showToast, onClose }) {
  const [filter, setFilter] = useState("전체");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ problem: "", suggestion: "", is_common: false, channels: [] });

  const filtered = useMemo(() => {
    return rules.filter(r => {
      if (filter === "공통" && !r.is_common) return false;
      if (filter !== "전체" && filter !== "공통" && (r.is_common || !r.channels?.includes(filter))) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        if (!r.problem.toLowerCase().includes(s) && !r.suggestion.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [rules, filter, search]);

  const counts = useMemo(() => {
    const c = { 전체: rules.length, 공통: rules.filter(r => r.is_common).length };
    CHANNELS.forEach(ch => { c[ch] = rules.filter(r => !r.is_common && r.channels?.includes(ch)).length; });
    return c;
  }, [rules]);

  const startEdit = (r) => {
    setEditing(r.id);
    setForm({ problem: r.problem, suggestion: r.suggestion, is_common: r.is_common, channels: r.channels || [] });
  };

  const startAdd = () => {
    setAdding(true);
    setForm({ problem: "", suggestion: "", is_common: false, channels: [] });
  };

  const handleSubmit = async () => {
    if (!form.problem.trim() || !form.suggestion.trim()) {
      showToast("문제 표현과 수정 제안은 필수입니다", "error"); return;
    }
    if (!form.is_common && form.channels.length === 0) {
      showToast("공통 또는 적용 채널을 선택해주세요", "error"); return;
    }
    const data = {
      problem: form.problem.trim(),
      suggestion: form.suggestion.trim(),
      is_common: form.is_common,
      channels: form.is_common ? [] : form.channels,
    };
    if (adding) {
      const { error } = await supabase.from("cs_rules").insert(data);
      if (error) { showToast("추가 실패: " + error.message, "error"); return; }
      showToast("규칙 추가 완료");
    } else {
      const { error } = await supabase.from("cs_rules").update(data).eq("id", editing);
      if (error) { showToast("수정 실패: " + error.message, "error"); return; }
      showToast("수정 완료");
    }
    await reload();
    setEditing(null); setAdding(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("cs_rules").delete().eq("id", id);
    if (error) { showToast("삭제 실패: " + error.message, "error"); return; }
    await reload();
    showToast("삭제 완료");
  };

  const toggleChannel = (ch) => {
    if (form.channels.includes(ch)) setForm({...form, channels: form.channels.filter(c => c !== ch)});
    else setForm({...form, channels: [...form.channels, ch]});
  };

  return (
    <div style={{position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20}} onClick={onClose}>
      <div style={{background: "#fff", borderRadius: 12, width: "100%", maxWidth: 880, maxHeight: "90vh", display: "flex", flexDirection: "column"}} onClick={e => e.stopPropagation()}>
        <div style={{padding: "20px 24px", borderBottom: `0.5px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <div>
            <h2 style={{margin: 0, fontSize: 18, fontWeight: 600}}>CS 검수 규칙 DB</h2>
            <p style={{margin: "3px 0 0", fontSize: 12, color: COLORS.textHint}}>총 {rules.length}건 등록됨</p>
          </div>
          <button onClick={onClose} style={{background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: COLORS.textHint}}>✕</button>
        </div>

        <div style={{padding: "16px 24px", overflowY: "auto", flex: 1}}>
          <div style={{display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap", alignItems: "center"}}>
            <span style={{fontSize: 11, color: COLORS.textHint, marginRight: 4}}>필터:</span>
            {["전체", "공통", ...CHANNELS].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "5px 11px", fontSize: 11, borderRadius: 12,
                background: filter === f ? (f === "공통" ? COLORS.accent : COLORS.text) : (f === "공통" ? COLORS.accentBg : "#fff"),
                color: filter === f ? "#fff" : (f === "공통" ? COLORS.accentText : "#555"),
                border: `0.5px solid ${filter === f ? "transparent" : (f === "공통" ? "#F0997B" : COLORS.borderInput)}`,
                cursor: "pointer"
              }}>{f} · {counts[f] || 0}</button>
            ))}
          </div>

          <div style={{display: "flex", gap: 8, marginBottom: 14}}>
            <input className="form-input" placeholder="검색..." value={search} onChange={e => setSearch(e.target.value)} style={{flex: 1}}/>
            <button className="btn btn-dark" onClick={startAdd}>+ 규칙 추가</button>
          </div>

          {(adding || editing) && (
            <div style={{background: COLORS.bg, border: `1px solid ${COLORS.accent}`, borderRadius: 8, padding: 16, marginBottom: 14}}>
              <p style={{margin: "0 0 10px", fontWeight: 500, fontSize: 13}}>{adding ? "신규 규칙 등록" : "규칙 수정"}</p>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10}}>
                <div>
                  <label className="form-label">문제 표현 *</label>
                  <input className="form-input" value={form.problem} onChange={e => setForm({...form, problem: e.target.value})} placeholder="예: 배송 지연"/>
                </div>
                <div>
                  <label className="form-label">수정 제안 *</label>
                  <input className="form-input" value={form.suggestion} onChange={e => setForm({...form, suggestion: e.target.value})} placeholder="예: 배송 일정"/>
                </div>
              </div>
              <label className="form-label">적용 범위</label>
              <label style={{display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, marginRight: 14, marginBottom: 8, cursor: "pointer"}}>
                <input type="checkbox" checked={form.is_common} onChange={e => setForm({...form, is_common: e.target.checked, channels: e.target.checked ? [] : form.channels})}/>
                <span style={{color: COLORS.accentText, fontWeight: 500}}>공통 (모든 채널 적용)</span>
              </label>
              {!form.is_common && (
                <div style={{display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5, marginTop: 6}}>
                  {CHANNELS.map(ch => (
                    <label key={ch} style={{display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, padding: "5px 8px", border: `0.5px solid ${form.channels.includes(ch) ? COLORS.text : COLORS.borderInput}`, borderRadius: 5, cursor: "pointer", background: form.channels.includes(ch) ? COLORS.text : "#fff", color: form.channels.includes(ch) ? "#fff" : "#555"}}>
                      <input type="checkbox" checked={form.channels.includes(ch)} onChange={() => toggleChannel(ch)} style={{display: "none"}}/>
                      {ch}
                    </label>
                  ))}
                </div>
              )}
              <div style={{display: "flex", gap: 8, marginTop: 14}}>
                <button className="btn btn-dark" onClick={handleSubmit}>저장</button>
                <button className="btn btn-light" onClick={() => { setEditing(null); setAdding(false); }}>취소</button>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={{padding: 30, textAlign: "center", color: COLORS.textLight, fontSize: 13}}>
              {rules.length === 0 ? "아직 등록된 규칙이 없습니다" : "검색 결과가 없습니다"}
            </div>
          ) : (
            <table style={{width: "100%", borderCollapse: "collapse", fontSize: 12}}>
              <thead style={{background: COLORS.surface}}>
                <tr>
                  <th style={{textAlign: "left", padding: "10px 12px", fontSize: 10, fontWeight: 500, color: COLORS.textHint, letterSpacing: "1px", textTransform: "uppercase"}}>문제 표현</th>
                  <th style={{textAlign: "left", padding: "10px 12px", fontSize: 10, fontWeight: 500, color: COLORS.textHint, letterSpacing: "1px", textTransform: "uppercase"}}>수정 제안</th>
                  <th style={{textAlign: "left", padding: "10px 12px", fontSize: 10, fontWeight: 500, color: COLORS.textHint, letterSpacing: "1px", textTransform: "uppercase"}}>적용 채널</th>
                  <th style={{width: 90}}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} style={{borderTop: `0.5px solid ${COLORS.border}`}}>
                    <td style={{padding: "11px 12px", color: COLORS.accentText, fontWeight: 500}}>{r.problem}</td>
                    <td style={{padding: "11px 12px"}}>
                      <span style={{color: COLORS.textLight, marginRight: 6}}>→</span>
                      <span style={{color: COLORS.success, fontWeight: 500}}>{r.suggestion}</span>
                    </td>
                    <td style={{padding: "11px 12px"}}>
                      {r.is_common ? (
                        <span style={{background: COLORS.accentBg, color: COLORS.accentText, fontSize: 10, padding: "2px 8px", borderRadius: 8, fontWeight: 500}}>공통 (전체 적용)</span>
                      ) : (
                        (r.channels || []).map(ch => (
                          <span key={ch} style={{background: "#F1EFE8", color: "#444", fontSize: 9, padding: "1px 6px", borderRadius: 8, marginRight: 3, fontWeight: 500}}>{ch}</span>
                        ))
                      )}
                    </td>
                    <td style={{padding: "11px 12px"}}>
                      <button onClick={() => startEdit(r)} style={{background: "transparent", border: "none", color: COLORS.textHint, cursor: "pointer", padding: "4px 8px", fontSize: 11}}>수정</button>
                      <button onClick={() => handleDelete(r.id)} style={{background: "transparent", border: "none", color: COLORS.textHint, cursor: "pointer", padding: "4px 8px", fontSize: 11}}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// 토스트
// ───────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  return (
    <div style={{
      position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)",
      background: type === "error" ? COLORS.accent : COLORS.text, color: "#fff",
      padding: "12px 24px", fontSize: 13, fontWeight: 500, borderRadius: 6,
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)", zIndex: 1100,
      animation: "slideIn 0.3s ease-out",
    }}>{msg}</div>
  );
}
