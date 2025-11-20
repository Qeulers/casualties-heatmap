import { supabase, STORAGE_CONFIG } from '../lib/supabase';

/**
 * Test Supabase Storage connection and bucket configuration
 * Run this in the browser console to diagnose issues
 */
export async function testSupabaseConnection() {
  console.log('=== Supabase Configuration ===');
  console.log('Bucket:', STORAGE_CONFIG.bucketName);
  console.log('File Path:', STORAGE_CONFIG.filePath);
  
  // Test 1: List buckets
  console.log('\n=== Test 1: List Buckets ===');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error('❌ Error listing buckets:', bucketsError);
  } else {
    console.log('✅ Available buckets:', buckets?.map(b => b.name));
    const bucketExists = buckets?.some(b => b.name === STORAGE_CONFIG.bucketName);
    if (!bucketExists) {
      console.error(`❌ Bucket "${STORAGE_CONFIG.bucketName}" not found!`);
    } else {
      console.log(`✅ Bucket "${STORAGE_CONFIG.bucketName}" exists`);
    }
  }
  
  // Test 2: List files in bucket
  console.log('\n=== Test 2: List Files in Bucket ===');
  const { data: files, error: filesError } = await supabase.storage
    .from(STORAGE_CONFIG.bucketName)
    .list();
  
  if (filesError) {
    console.error('❌ Error listing files:', filesError);
  } else {
    console.log('✅ Files in bucket:', files?.map(f => f.name));
    const fileExists = files?.some(f => f.name === STORAGE_CONFIG.filePath);
    if (!fileExists) {
      console.error(`❌ File "${STORAGE_CONFIG.filePath}" not found in bucket!`);
      console.log('Available files:', files);
    } else {
      console.log(`✅ File "${STORAGE_CONFIG.filePath}" exists`);
    }
  }
  
  // Test 3: Get public URL
  console.log('\n=== Test 3: Get Public URL ===');
  const { data: urlData } = supabase.storage
    .from(STORAGE_CONFIG.bucketName)
    .getPublicUrl(STORAGE_CONFIG.filePath);
  
  console.log('Public URL:', urlData.publicUrl);
  
  // Test 4: Try to download
  console.log('\n=== Test 4: Download File ===');
  const { data: downloadData, error: downloadError } = await supabase.storage
    .from(STORAGE_CONFIG.bucketName)
    .download(STORAGE_CONFIG.filePath);
  
  if (downloadError) {
    console.error('❌ Error downloading file:', downloadError);
    console.error('Error details:', JSON.stringify(downloadError, null, 2));
  } else {
    console.log('✅ File downloaded successfully');
    console.log('File size:', downloadData?.size, 'bytes');
  }
  
  // Test 5: Check bucket policies
  console.log('\n=== Test 5: Bucket Configuration ===');
  console.log('If download failed, check:');
  console.log('1. Bucket is public OR has appropriate RLS policies');
  console.log('2. File path is correct (case-sensitive)');
  console.log('3. File actually exists in the bucket');
  console.log('\nTo make bucket public:');
  console.log('Supabase Dashboard → Storage → Your Bucket → Policies → New Policy → Allow public read access');
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
}
