-- ═══════════════════════════════════════════════════════════
-- CS 이미지 검수 대시보드 · Supabase 초기 설정 SQL
-- 
-- 사용법: Supabase 새 프로젝트에서 SQL Editor에 이 전체 파일을
--        복사 붙여넣기 → "Run" 버튼 한 번만 클릭
-- ═══════════════════════════════════════════════════════════

-- 1) CS 검수 규칙 테이블
CREATE TABLE IF NOT EXISTS cs_rules (
  id BIGSERIAL PRIMARY KEY,
  problem TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  channels TEXT[] DEFAULT '{}',
  is_common BOOLEAN DEFAULT FALSE,
  created_by TEXT DEFAULT '미기명',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) CS 검수 이력 테이블
CREATE TABLE IF NOT EXISTS cs_reviews (
  id BIGSERIAL PRIMARY KEY,
  reviewer TEXT DEFAULT '미기명',
  channel TEXT NOT NULL,
  product TEXT DEFAULT '',
  ocr_text TEXT,
  auto_detections JSONB DEFAULT '[]'::jsonb,
  manual_issues JSONB DEFAULT '[]'::jsonb,
  total_issue_count INT DEFAULT 0,
  status TEXT DEFAULT '검수완료',
  thumbnail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) RLS (팀 공유 - 누구나 읽기/쓰기 가능)
ALTER TABLE cs_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to cs_rules" ON cs_rules;
CREATE POLICY "Allow all access to cs_rules" ON cs_rules
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to cs_reviews" ON cs_reviews;
CREATE POLICY "Allow all access to cs_reviews" ON cs_reviews
  FOR ALL USING (true) WITH CHECK (true);

-- 4) 시작 규칙 5건 삽입 (예시)
INSERT INTO cs_rules (problem, suggestion, channels, is_common) VALUES
('환불 불가', '교환/반품 정책 안내', '{}', TRUE),
('배송 불가 지역', '배송 제한 지역', '{}', TRUE),
('배송 지연', '배송 일정', '{직영몰,카카오}', FALSE),
('최저가', '특가/할인가', '{올리브영}', FALSE),
('방송 단독가', '방송 특별가', '{홈쇼핑}', FALSE);

-- ✅ 완료! 이제 App.jsx의 Supabase 키를 채우면 됩니다.
