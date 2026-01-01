-- Add exam_committee column to contestants table
ALTER TABLE contestants
ADD COLUMN exam_committee TEXT;
-- Add a comment to describe the column
COMMENT ON COLUMN contestants.exam_committee IS 'اللجنة التي سيختبر بها المتسابق';