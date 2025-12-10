// ================================================================
// DIAGNOSTIC FRONTEND - Vérifier l'authentification
// ================================================================
// À exécuter dans la console du navigateur (F12)

async function diagnoseAuth() {
  console.log('🔍 DIAGNOSTIC SUPABASE AUTH');
  
  try {
    // 1. Vérifier la session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('📍 Session:', session ? `✅ Connecté (${session.user.email})` : '❌ Non connecté');
    
    if (!session) {
      console.log('⚠️  Pas de session active');
      return;
    }

    // 2. Vérifier get_user_profile RPC
    console.log('\n🔧 Test get_user_profile RPC...');
    const { data: profileRPC, error: rpcError } = await supabase
      .rpc('get_user_profile', { input_user_id: session.user.id });
    
    if (rpcError) {
      console.error('❌ RPC Error:', rpcError);
    } else {
      console.log('✅ RPC Success:', profileRPC);
    }

    // 3. Vérifier accès direct profiles
    console.log('\n📊 Test accès profiles table...');
    const { data: directProfile, error: directError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (directError) {
      console.error('❌ Direct Query Error:', directError);
    } else {
      console.log('✅ Direct Query Success:', directProfile);
    }

    // 4. Vérifier get_my_role
    console.log('\n👤 Test get_my_role...');
    const { data: roleData, error: roleError } = await supabase
      .rpc('get_my_role');
    
    if (roleError) {
      console.error('❌ get_my_role Error:', roleError);
    } else {
      console.log('✅ get_my_role Success:', roleData);
    }

    // 5. Vérifier current_user_id
    console.log('\n🆔 Test current_user_id...');
    const { data: userId, error: userIdError } = await supabase
      .rpc('current_user_id');
    
    if (userIdError) {
      console.error('❌ current_user_id Error:', userIdError);
    } else {
      console.log('✅ current_user_id Success:', userId);
    }

    console.log('\n✅ DIAGNOSTIC COMPLET');
  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

// Lancer le diagnostic
diagnoseAuth();
