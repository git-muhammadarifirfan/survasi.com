'use strict';
/**
 * @file routes/kemendikdasmen.js
 * @description Proxy endpoints for Kemendikdasmen public school data API.
 *
 * These endpoints proxy requests to the government API to avoid CORS issues
 * when fetching school data from the browser.
 *
 * Base URL: https://sekolah.data.kemendikdasmen.go.id/v1/sekolah-service/sekolah
 *
 * POST /api/kemendikdasmen/cari-sekolah       → Search schools
 * GET  /api/kemendikdasmen/detail/:sekolahId   → Full detail for a school
 * GET  /api/kemendikdasmen/peserta-didik/:id   → Student data (peserta didik)
 * GET  /api/kemendikdasmen/ptk/:id             → Teacher/staff data (PTK)
 * GET  /api/kemendikdasmen/rombongan-belajar/:id → Study groups
 * GET  /api/kemendikdasmen/akreditasi/:id      → Accreditation data
 * GET  /api/kemendikdasmen/sarana-prasarana/:id → Facilities data
 * GET  /api/kemendikdasmen/sanitasi/:id        → Sanitation data
 * GET  /api/kemendikdasmen/tik/:id             → ICT data
 * GET  /api/kemendikdasmen/rapor/:id           → Report card data
 */

const router = require('express').Router();

const BASE_SEKOLAH_URL = 'https://sekolah.data.kemendikdasmen.go.id/v1/sekolah-service/sekolah';
const SEARCH_API_URL   = `${BASE_SEKOLAH_URL}/cari-sekolah`;
const DETAIL_API_URL   = `${BASE_SEKOLAH_URL}/full-detail`;

// Sub-endpoints to fetch
const MODAL_ENDPOINTS = {
  'peserta-didik':      `${BASE_SEKOLAH_URL}/peserta-didik`,
  'rombongan-belajar':  `${BASE_SEKOLAH_URL}/rombongan-belajar`,
  'akreditasi':         `${BASE_SEKOLAH_URL}/akreditasi`,
  'ptk':                `${BASE_SEKOLAH_URL}/ptk`,
  'sarana-prasarana':    `${BASE_SEKOLAH_URL}/sarana-prasarana`,
  'sanitasi':           `${BASE_SEKOLAH_URL}/sanitasi`,
  'tik':                `${BASE_SEKOLAH_URL}/tik`,
  'rapor':              `${BASE_SEKOLAH_URL}/rapor`,
};

// Request timeout (15 seconds)
const FETCH_TIMEOUT = 15000;

/**
 * Helper: fetch with timeout
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'BSAN-Jatim-Monitoring/1.0',
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ─── POST /api/kemendikdasmen/cari-sekolah ─────────────────────────────────
// Proxy search: forward the POST body to Kemendikdasmen API
router.post('/cari-sekolah', async (req, res) => {
  try {
    const payload = {
      keyword: req.body.keyword || '',
      page: req.body.page || req.body.page_number || 1,
      size: req.body.size || req.body.page_size || 10,
      ...(req.body.kode_wilayah ? { kode_wilayah: req.body.kode_wilayah } : {}),
      ...(req.body.bentuk_pendidikan_id ? { bentuk_pendidikan_id: req.body.bentuk_pendidikan_id } : {}),
      ...(req.body.status_sekolah ? { status_sekolah: req.body.status_sekolah } : {}),
    };

    const response = await fetchWithTimeout(SEARCH_API_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('[Kemendikdasmen] cari-sekolah proxy error:', err.message);
    return res.status(502).json({
      success: false,
      message: 'Gagal terhubung ke API Kemendikdasmen. Silakan coba lagi nanti.',
      error: err.message,
    });
  }
});

// ─── GET /api/kemendikdasmen/detail/:sekolahId ─────────────────────────────
// Full detail of a single school
router.get('/detail/:sekolahId', async (req, res) => {
  try {
    const { sekolahId } = req.params;
    const url = `${DETAIL_API_URL}/${sekolahId}`;

    const response = await fetchWithTimeout(url);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('[Kemendikdasmen] detail proxy error:', err.message);
    return res.status(502).json({
      success: false,
      message: 'Gagal mengambil detail sekolah dari Kemendikdasmen.',
      error: err.message,
    });
  }
});

// ─── GET /api/kemendikdasmen/:endpoint/:sekolahId ──────────────────────────
// Dynamic proxy for all sub-endpoints (peserta-didik, ptk, sarana-prasarana, etc.)
router.get('/:endpoint/:sekolahId', async (req, res) => {
  try {
    const { endpoint, sekolahId } = req.params;
    const baseUrl = MODAL_ENDPOINTS[endpoint];

    if (!baseUrl) {
      return res.status(400).json({
        success: false,
        message: `Endpoint "${endpoint}" tidak tersedia. Pilihan: ${Object.keys(MODAL_ENDPOINTS).join(', ')}`,
      });
    }

    const url = `${baseUrl}/${sekolahId}`;
    const response = await fetchWithTimeout(url);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error(`[Kemendikdasmen] ${req.params.endpoint} proxy error:`, err.message);
    return res.status(502).json({
      success: false,
      message: `Gagal mengambil data ${req.params.endpoint} dari Kemendikdasmen.`,
      error: err.message,
    });
  }
});

// ─── GET /api/kemendikdasmen/all/:sekolahId ────────────────────────────────
// Fetch full-detail + all sub-endpoints in parallel for a single school
router.get('/all/:sekolahId', async (req, res) => {
  try {
    const { sekolahId } = req.params;

    const promises = [
      fetchWithTimeout(`${DETAIL_API_URL}/${sekolahId}`)
        .then(r => r.json())
        .then(data => ({ key: 'detail', data }))
        .catch(err => ({ key: 'detail', error: err.message })),
      ...Object.entries(MODAL_ENDPOINTS).map(([key, baseUrl]) =>
        fetchWithTimeout(`${baseUrl}/${sekolahId}`)
          .then(r => r.json())
          .then(data => ({ key, data }))
          .catch(err => ({ key, error: err.message }))
      ),
    ];

    const results = await Promise.allSettled(promises);
    const combined = {};

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { key, data, error } = result.value;
        combined[key] = error ? { error } : data;
      }
    }

    return res.json({ success: true, sekolah_id: sekolahId, data: combined });
  } catch (err) {
    console.error('[Kemendikdasmen] all proxy error:', err.message);
    return res.status(502).json({
      success: false,
      message: 'Gagal mengambil data lengkap dari Kemendikdasmen.',
      error: err.message,
    });
  }
});

module.exports = router;
