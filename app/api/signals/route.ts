import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const ticker = searchParams.get('ticker');
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('signals')
      .select('*', { count: 'exact' });
    
    // Add filters
    if (status && status !== 'all') {
      query = query.eq('status', status.toUpperCase());
    }
    
    if (ticker) {
      query = query.ilike('ticker', `%${ticker}%`);
    }
    
    // Add pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      signals: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching signals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated and is admin
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (profileError || !profile || profile.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const {
      ticker,
      signal_type,
      entry_price,
      target_price,
      stop_loss_price,
      notes
    } = body;
    
    // Validate required fields
    if (!ticker || !signal_type || !entry_price || !target_price || !stop_loss_price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate signal_type
    if (!['LONG', 'SHORT'].includes(signal_type)) {
      return NextResponse.json(
        { error: 'Invalid signal_type. Must be LONG or SHORT' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('signals')
      .insert({
        ticker: ticker.toUpperCase(),
        signal_type,
        entry_price,
        target_price,
        stop_loss_price,
        notes,
        created_by: session.user.id
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ signal: data }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating signal:', error);
    return NextResponse.json(
      { error: 'Failed to create signal' },
      { status: 500 }
    );
  }
}
