-- Safe migration to update signals table schema
-- This checks current structure and adapts accordingly

-- First, let's check what columns currently exist and add missing ones
DO $$
BEGIN
    -- Add direction column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'signals' AND column_name = 'direction') THEN
        -- Check if signal_type exists and rename it
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'signals' AND column_name = 'signal_type') THEN
            ALTER TABLE public.signals RENAME COLUMN signal_type TO direction;
        ELSE
            -- Add direction column if neither exists
            ALTER TABLE public.signals ADD COLUMN direction VARCHAR(10) NOT NULL DEFAULT 'long';
        END IF;
    END IF;

    -- Add entry1 column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'signals' AND column_name = 'entry1') THEN
        ALTER TABLE public.signals ADD COLUMN entry1 DECIMAL(20,8) NOT NULL DEFAULT 0;
    END IF;

    -- Add entry2 column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'signals' AND column_name = 'entry2') THEN
        ALTER TABLE public.signals ADD COLUMN entry2 DECIMAL(20,8) NULL;
    END IF;

    -- Add target column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'signals' AND column_name = 'target') THEN
        ALTER TABLE public.signals ADD COLUMN target DECIMAL(20,8) NOT NULL DEFAULT 0;
    END IF;

    -- Add stop_loss column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'signals' AND column_name = 'stop_loss') THEN
        ALTER TABLE public.signals ADD COLUMN stop_loss DECIMAL(20,8) NOT NULL DEFAULT 0;
    END IF;

    -- Add thesis column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'signals' AND column_name = 'thesis') THEN
        ALTER TABLE public.signals ADD COLUMN thesis TEXT NULL;
    END IF;

    -- Add profile column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'signals' AND column_name = 'profile') THEN
        ALTER TABLE public.signals ADD COLUMN profile VARCHAR(50) NULL;
    END IF;
END $$;

-- Drop old price columns if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'signals' AND column_name = 'entry_price') THEN
        ALTER TABLE public.signals DROP COLUMN entry_price;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'signals' AND column_name = 'target_price') THEN
        ALTER TABLE public.signals DROP COLUMN target_price;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'signals' AND column_name = 'stop_loss_price') THEN
        ALTER TABLE public.signals DROP COLUMN stop_loss_price;
    END IF;
END $$;

-- Update constraints safely
DO $$
BEGIN
    -- Drop old constraints if they exist
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE table_name = 'signals' AND constraint_name = 'signals_signal_type_check') THEN
        ALTER TABLE public.signals DROP CONSTRAINT signals_signal_type_check;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE table_name = 'signals' AND constraint_name = 'signals_status_check') THEN
        ALTER TABLE public.signals DROP CONSTRAINT signals_status_check;
    END IF;

    -- Add new constraints
    ALTER TABLE public.signals ADD CONSTRAINT signals_direction_check 
        CHECK (direction IN ('LONG', 'SHORT', 'long', 'short'));

    ALTER TABLE public.signals ADD CONSTRAINT signals_status_check 
        CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED', 'FILLED', 'open', 'closed', 'cancelled', 'filled'));
END $$;

-- Recreate indexes safely
DROP INDEX IF EXISTS idx_signals_status;
DROP INDEX IF EXISTS idx_signals_ticker;
DROP INDEX IF EXISTS idx_signals_created_at;
DROP INDEX IF EXISTS idx_signals_created_by;

CREATE INDEX IF NOT EXISTS idx_signals_status ON public.signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_ticker ON public.signals(ticker);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON public.signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_created_by ON public.signals(created_by);

-- Clear existing data to avoid conflicts
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
