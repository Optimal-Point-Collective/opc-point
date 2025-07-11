-- Add bids column to signals table for Precision 2.0 calculator
DO $$
BEGIN
    -- Add bids column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'signals' AND column_name = 'bids') THEN
        ALTER TABLE public.signals ADD COLUMN bids INTEGER NOT NULL DEFAULT 1;
    END IF;
END $$;

-- Add constraint to ensure bids is between 1 and 10
ALTER TABLE public.signals ADD CONSTRAINT signals_bids_check 
    CHECK (bids >= 1 AND bids <= 10);

-- Update existing signals with default bids value based on whether they have entry2
UPDATE public.signals SET bids = CASE 
    WHEN entry2 IS NOT NULL AND entry2 != entry1 THEN 4
    ELSE 1
END;
