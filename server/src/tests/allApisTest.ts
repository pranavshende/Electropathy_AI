import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import http from 'http';
import authRoutes from '../routes/authRoutes.js';
import patientRoutes from '../routes/patientRoutes.js';
import conversationRoutes from '../routes/conversationRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';

interface ApiTestLog {
  endpoint: string;
  method: string;
  statusExpected: number;
  statusReceived: number;
  passed: boolean;
  durationMs: number;
  details?: any;
}

const testLogs: ApiTestLog[] = [];
const JWT_SECRET = process.env.JWT_SECRET || 'electropathy_secret_key_default';

// Generate test tokens
const adminToken = jwt.sign(
  { userId: 'admin-test-id', mobileNumber: '+919999999999', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const patientToken = jwt.sign(
  { userId: 'user-test-id', mobileNumber: '+919876543210', role: 'patient' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

async function runApiTests() {
  console.log('\n======================================================');
  console.log('🌐 EXHAUSTIVE LIVE API TEST SUITE: ELECTROPATHY AI');
  console.log('======================================================\n');

  // 1. Build Isolated Express Test App
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Mount Application Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/admin', adminRoutes);

  // Health endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Electropathy AI Backend API',
      smsProvider: process.env.SMS_PROVIDER || 'blacksms',
      timestamp: new Date().toISOString()
    });
  });

  const TEST_PORT = 5099;
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, '127.0.0.1', () => {
      console.log(`📡 Test Server listening on http://127.0.0.1:${TEST_PORT}\n`);
      resolve();
    });
  });

  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  async function executeRequest(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    expectedStatus: number,
    body?: any,
    token?: string
  ): Promise<any> {
    const start = Date.now();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      const durationMs = Date.now() - start;
      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = { rawText: 'No JSON body' };
      }

      const passed = res.status === expectedStatus;
      testLogs.push({
        endpoint: path,
        method,
        statusExpected: expectedStatus,
        statusReceived: res.status,
        passed,
        durationMs,
        details: json
      });

      if (passed) {
        console.log(`✅ [${res.status}] ${method} ${path} (${durationMs}ms)`);
      } else {
        console.error(`❌ [${res.status} != ${expectedStatus}] ${method} ${path} (${durationMs}ms)`);
        console.error('Response details:', json);
      }

      return json;
    } catch (err: any) {
      const durationMs = Date.now() - start;
      testLogs.push({
        endpoint: path,
        method,
        statusExpected: expectedStatus,
        statusReceived: 0,
        passed: false,
        durationMs,
        details: err.message
      });
      console.error(`❌ [NETWORK ERROR] ${method} ${path}:`, err.message);
      return null;
    }
  }

  try {
    // -------------------------------------------------------------
    // API 1: Health Check Endpoint
    // -------------------------------------------------------------
    console.log('\n--- 1. Health & Status APIs ---');
    await executeRequest('GET', '/health', 200);

    // -------------------------------------------------------------
    // API 2: Authentication Security & Validation
    // -------------------------------------------------------------
    console.log('\n--- 2. Authentication & Security APIs ---');
    await executeRequest('POST', '/api/auth/send-otp', 400, { mobileNumber: 'invalid' });
    await executeRequest('POST', '/api/auth/verify-otp', 400, { mobileNumber: '+919876543210' }); // missing otp
    await executeRequest('POST', '/api/auth/login', 400, {}); // missing credentials

    // -------------------------------------------------------------
    // API 3: Security & RBAC Guards
    // -------------------------------------------------------------
    console.log('\n--- 3. Authorization Guards (Security Check) ---');
    await executeRequest('GET', '/api/admin/protocol/matrix', 401); // No token -> 401
    await executeRequest('GET', '/api/admin/protocol/matrix', 403, undefined, patientToken); // Patient token -> 403

    // -------------------------------------------------------------
    // API 4: Dual-Table Statistics API
    // -------------------------------------------------------------
    console.log('\n--- 4. v2026 Dual-Table Knowledge Registries API ---');
    const statsRes = await executeRequest('GET', '/api/admin/protocol/dual-table-stats', 200, undefined, adminToken);
    if (statsRes?.success) {
      console.log(`   ℹ️ Table A Count: ${statsRes.totalTableARecords} | Table B Count: ${statsRes.totalTableBRecords}`);
      console.log(`   ℹ️ Distinct Identities: ${statsRes.totalDistinctIdentities} | Traceable Mappings: ${statsRes.totalMappingsCount}`);
    }

    // -------------------------------------------------------------
    // API 5: State-Organ Mapping Matrix API
    // -------------------------------------------------------------
    console.log('\n--- 5. State–Organ Mapping Matrix & Taxonomies API ---');
    const matrixRes = await executeRequest('GET', '/api/admin/protocol/matrix', 200, undefined, adminToken);
    if (matrixRes?.success) {
      console.log(`   ℹ️ Matrix Entries: ${matrixRes.stats.totalMatrixEntries} | Body Systems: ${matrixRes.organCount} | Disease States: ${matrixRes.stateCount}`);
    }

    // -------------------------------------------------------------
    // API 6: Clinical Protocol Evaluation (Stages 3 -> 6)
    // -------------------------------------------------------------
    console.log('\n--- 6. Protocol Optimization API: Functional Gastritis Case ---');
    const evalRes = await executeRequest(
      'POST',
      '/api/admin/protocol/evaluate',
      200,
      {
        fullName: 'Rahul Verma',
        age: 42,
        gender: 'male',
        freeTextQuery: 'Patient experiences chronic hyperacidity, severe heartburn after oily meals, and gastric bloating',
        severity: 7,
        temperament: 'Bilious'
      },
      adminToken
    );

    if (evalRes?.success) {
      console.log(`   ℹ️ Primary State: ${evalRes.resolution?.primaryDiseaseState?.stateName}`);
      console.log(`   ℹ️ Top Converged Remedies:`, evalRes.convergence?.allRankedCandidates?.slice(0, 4).map((c: any) => `${c.canonicalCode} (${c.category})`));
      console.log(`   ℹ️ 4 Bottles Generated (Option A): ${evalRes.protocol?.optionA?.bottles?.length} bottles`);
      evalRes.protocol?.optionA?.bottles?.forEach((b: any) => {
        console.log(`      • Bottle ${b.bottleNumber} [${b.recommendedDilution}]: ${b.remedies.map((r: any) => r.code).join(', ')} ${b.electricity ? `+ ${b.electricity.code}` : ''}`);
      });
    }

    // -------------------------------------------------------------
    // API 7: Clinical Safety Intercept API (Emergency Red Flag)
    // -------------------------------------------------------------
    console.log('\n--- 7. Protocol Optimization API: Emergency Triage Intercept ---');
    const emergencyRes = await executeRequest(
      'POST',
      '/api/admin/protocol/evaluate',
      200,
      {
        fullName: 'Emergency Patient',
        age: 60,
        gender: 'male',
        freeTextQuery: 'Crushing chest pain radiating down left arm with cold diaphoresis',
        severity: 10
      },
      adminToken
    );

    if (emergencyRes?.success) {
      console.log(`   ℹ️ Safety Gate Passed: ${emergencyRes.assessment?.safetyGate?.passed}`);
      console.log(`   ℹ️ Alerts: ${emergencyRes.assessment?.safetyGate?.alerts?.map((a: any) => a.category).join('; ')}`);
      console.log(`   ℹ️ Notice: ${emergencyRes.protocol?.optionA?.practitionerNotice}`);
    }

    // -------------------------------------------------------------
    // API 8: Approved Knowledge Chunks API
    // -------------------------------------------------------------
    console.log('\n--- 8. Approved Materia Medica Knowledge Base API ---');
    const knowRes = await executeRequest('GET', '/api/admin/knowledge?page=1&limit=5', 200, undefined, adminToken);
    if (knowRes?.success) {
      console.log(`   ℹ️ Knowledge Chunks Loaded: ${knowRes.chunks?.length} (Total Available: ${knowRes.pagination?.total})`);
    }

    // -------------------------------------------------------------
    // API 9: Admin Grounded AI Clinical Chatbot API
    // -------------------------------------------------------------
    console.log('\n--- 9. Admin Decision Support Grounded AI Chat API ---');
    const chatRes = await executeRequest(
      'POST',
      '/api/admin/chat',
      200,
      {
        query: 'What is the recommended 4-bottle protocol for severe hyperacidity with bilious temperament?'
      },
      adminToken
    );
    if (chatRes?.success) {
      console.log(`   ℹ️ AI Engine Model: ${chatRes.model} (${chatRes.latencyMs}ms)`);
      console.log(`   ℹ️ Dataset Matches Grounded: ${chatRes.doctorDatasetMatches?.length}`);
      console.log(`   ℹ️ 4-Bottle Dual Protocol Attached: ${Boolean(chatRes.dualProtocol)}`);
    }

  } finally {
    // Cleanly close test server
    server.close();
  }

  // Summary
  const total = testLogs.length;
  const passed = testLogs.filter(t => t.passed).length;
  const failed = total - passed;

  console.log('\n======================================================');
  console.log(`📊 LIVE API TEST SUMMARY: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runApiTests().catch(err => {
  console.error('Fatal API test error:', err);
  process.exit(1);
});
