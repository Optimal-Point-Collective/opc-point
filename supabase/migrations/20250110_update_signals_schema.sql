-- Migration to update signals table schema to match application expectations

-- First, drop existing constraints and indexes related to old columns
DROP INDEX IF EXISTS idx_signals_status;
DROP INDEX IF EXISTS idx_signals_ticker;

-- Rename and restructure columns to match application expectations
ALTER TABLE public.signals 
  -- Rename signal_type to direction
  RENAME COLUMN signal_type TO direction;

-- Update the check constraint for direction
ALTER TABLE public.signals DROP CONSTRAINT IF EXISTS signals_signal_type_check;
ALTER TABLE public.signals ADD CONSTRAINT signals_direction_check 
  CHECK (direction IN ('LONG', 'SHORT', 'long', 'short'));

-- Drop old price columns
ALTER TABLE public.signals 
  DROP COLUMN IF EXISTS entry_price,
  DROP COLUMN IF EXISTS target_price,
  DROP COLUMN IF EXISTS stop_loss_price;

-- Add new price columns with proper numeric types
ALTER TABLE public.signals 
  ADD COLUMN entry1 DECIMAL(20,8) NOT NULL DEFAULT 0,
  ADD COLUMN entry2 DECIMAL(20,8) NULL,
  ADD COLUMN target DECIMAL(20,8) NOT NULL DEFAULT 0,
  ADD COLUMN stop_loss DECIMAL(20,8) NOT NULL DEFAULT 0;

-- Add missing columns
ALTER TABLE public.signals 
  ADD COLUMN IF NOT EXISTS thesis TEXT NULL,
  ADD COLUMN IF NOT EXISTS profile VARCHAR(50) NULL;

-- Update status constraint to include lowercase values
ALTER TABLE public.signals DROP CONSTRAINT IF EXISTS signals_status_check;
ALTER TABLE public.signals ADD CONSTRAINT signals_status_check 
  CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED', 'FILLED', 'open', 'closed', 'cancelled', 'filled'));

-- Recreate indexes with proper column names
CREATE INDEX IF NOT EXISTS idx_signals_status ON public.signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_ticker ON public.signals(ticker);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON public.signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_created_by ON public.signals(created_by);

-- Clear existing data since the schema has changed significantly
DELETE FROM public.signals;

-- Insert sample data with new schema
INSERT INTO public.signals (ticker, direction, entry1, entry2, target, stop_loss, status, thesis, profile, created_at) VALUES
('HYPE', 'long', 35.83, NULL, 41.22, 34.56, 'open', 'Strong momentum breakout expected', 'SWING', '2025-01-01 00:00:00+00'),
('BTC', 'long', 101198.9, NULL, 106320, 99450, 'open', 'Bitcoin breaking key resistance levels', 'SWING', '2025-01-01 00:00:00+00'),
('AAVE', 'long', 231, 224, 314, 210, 'open', 'DeFi sector showing strength', 'SCALP', '2025-01-01 00:00:00+00'),
('ETH', 'long', 2387, 2377, 2610, 2299, 'open', 'Ethereum 2.0 upgrade momentum', 'SWING', '2025-01-01 00:00:00+00'),
('SOL', 'long', 180.5, NULL, 195.0, 175.2, 'closed', 'Solana ecosystem growth', 'SWING', '2024-12-28 00:00:00+00'),
('ADA', 'long', 0.85, NULL, 0.92, 0.82, 'closed', 'Cardano smart contracts adoption', 'SCALP', '2024-12-25 00:00:00+00'),
('LINK', 'short', 22.50, NULL, 20.00, 23.50, 'cancelled', 'Chainlink overvalued short-term', 'SCALP', '2024-12-20 00:00:00+00'),
('DOT', 'long', 7.80, NULL, 8.50, 7.40, 'closed', 'Polkadot parachain momentum', 'SWING', '2024-12-15 00:00:00+00');

-- Update closed signals with P&L data
UPDATE public.signals SET 
  pnl_percentage = 8.5,
  closed_at = '2024-12-30 00:00:00+00'
WHERE ticker = 'SOL';

UPDATE public.signals SET 
  pnl_percentage = -3.5,
  closed_at = '2024-12-27 00:00:00+00'
WHERE ticker = 'ADA';

UPDATE public.signals SET 
  pnl_percentage = 12.3,
  closed_at = '2024-12-17 00:00:00+00'
WHERE ticker = 'DOT';
