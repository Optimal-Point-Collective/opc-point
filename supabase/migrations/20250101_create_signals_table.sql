-- Create signals table for storing trading signals
CREATE TABLE IF NOT EXISTS public.signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker VARCHAR(20) NOT NULL,
  signal_type VARCHAR(10) NOT NULL CHECK (signal_type IN ('LONG', 'SHORT')),
  entry_price VARCHAR(50) NOT NULL, -- Store as string to handle ranges like "231-224"
  target_price VARCHAR(50) NOT NULL,
  stop_loss_price VARCHAR(50) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED')),
  pnl_percentage DECIMAL(8,2) NULL, -- P&L percentage when signal is closed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  closed_at TIMESTAMP WITH TIME ZONE NULL,
  notes TEXT NULL
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_signals_status ON public.signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_ticker ON public.signals(ticker);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON public.signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_created_by ON public.signals(created_by);

-- Enable RLS
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view signals
CREATE POLICY "Users can view all signals" ON public.signals
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only admins can insert signals
CREATE POLICY "Admins can insert signals" ON public.signals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Policy: Only admins can update signals
CREATE POLICY "Admins can update signals" ON public.signals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Policy: Only admins can delete signals
CREATE POLICY "Admins can delete signals" ON public.signals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_signals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_signals_updated_at
  BEFORE UPDATE ON public.signals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_signals_updated_at();

-- Insert sample data (matching the current mockSignals)
INSERT INTO public.signals (ticker, signal_type, entry_price, target_price, stop_loss_price, status, created_at) VALUES
('HYPE', 'LONG', '35.83', '41.22', '34.56', 'OPEN', '2025-01-01 00:00:00+00'),
('BTC', 'LONG', '101198.9', '106320', '99450', 'OPEN', '2025-01-01 00:00:00+00'),
('AAVE', 'LONG', '231-224', '314', '210', 'OPEN', '2025-01-01 00:00:00+00'),
('ETH', 'LONG', '2387-2377', '2610', '2299', 'OPEN', '2025-01-01 00:00:00+00'),
('SOL', 'LONG', '180.5', '195.0', '175.2', 'CLOSED', '2024-12-28 00:00:00+00'),
('ADA', 'LONG', '0.85', '0.92', '0.82', 'CLOSED', '2024-12-25 00:00:00+00'),
('LINK', 'SHORT', '22.50', '20.00', '23.50', 'CANCELLED', '2024-12-20 00:00:00+00'),
('DOT', 'LONG', '7.80', '8.50', '7.40', 'CLOSED', '2024-12-15 00:00:00+00');

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

-- Grant necessary permissions
GRANT SELECT ON public.signals TO authenticated;
GRANT ALL ON public.signals TO service_role;
