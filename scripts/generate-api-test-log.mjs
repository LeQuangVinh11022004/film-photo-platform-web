import fs from "node:fs";
import path from "node:path";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const BASE_URL = process.env.TEST_API_BASE_URL;
const LOG_TXT_PATH = path.resolve("api-test.log");

const logs = [];
let passCount = 0;
let failCount = 0;

function truncateJson(obj, maxLen = 600) {
  if (obj === null || obj === undefined || obj === "") return "(empty)";
  const str = typeof obj === "string" ? obj : JSON.stringify(obj);
  return str.length > maxLen ? `${str.slice(0, maxLen)}... [truncated]` : str;
}

async function req(section, description, method, endpointPath, { token, body, expectedStatus } = {}) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const startedAt = Date.now();
  const timestamp = new Date().toISOString();
  let res;
  let text = "";
  let data = null;

  try {
    res = await fetch(`${BASE_URL}${endpointPath}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
  } catch (networkErr) {
    const durationMs = Date.now() - startedAt;
    failCount++;
    const entry = {
      index: logs.length + 1,
      timestamp,
      section,
      description,
      method,
      path: endpointPath,
      requestBody: body ?? null,
      status: "NETWORK_ERROR",
      expectedStatus: expectedStatus ?? "2xx",
      durationMs,
      passed: false,
      responsePreview: networkErr.message,
    };
    logs.push(entry);
    throw networkErr;
  }

  const durationMs = Date.now() - startedAt;
  const allowed =
    expectedStatus !== undefined
      ? Array.isArray(expectedStatus)
        ? expectedStatus
        : [expectedStatus]
      : null;

  const passed = allowed ? allowed.includes(res.status) : res.ok;
  if (passed) passCount++;
  else failCount++;

  // Redact JWT token in response preview for cleaner logs
  let previewObj = data;
  if (previewObj && typeof previewObj === "object" && previewObj.token) {
    previewObj = { ...previewObj, token: `${String(previewObj.token).slice(0, 24)}...[REDACTED]` };
  }

  const entry = {
    index: logs.length + 1,
    timestamp,
    section,
    description,
    method,
    path: endpointPath,
    requestBody: body ?? null,
    status: res.status,
    expectedStatus: allowed ? allowed.join("/") : "2xx",
    durationMs,
    passed,
    responsePreview: truncateJson(previewObj),
  };
  logs.push(entry);

  console.log(
    `${passed ? "PASS" : "FAIL"} [#${String(entry.index).padStart(2, "0")}] [${res.status}] (${durationMs}ms) ${method} ${endpointPath} - ${description}`,
  );

  if (!passed) {
    throw new Error(
      `[${method} ${endpointPath}] Expected status ${entry.expectedStatus}, got ${res.status}: ${text}`,
    );
  }

  return { status: res.status, data };
}

function writeLogFiles(runStartedAt, errorMsg = null) {
  const lines = [];
  lines.push("================================================================================");
  lines.push("                 AUTOMATED API INTEGRATION TEST EXECUTION LOG                   ");
  lines.push("================================================================================");
  lines.push(`Base URL      : ${BASE_URL}`);
  lines.push(`Run Started   : ${runStartedAt}`);
  lines.push(`Run Completed : ${new Date().toISOString()}`);
  lines.push(`Total Calls   : ${logs.length} (Passed: ${passCount}, Failed: ${failCount})`);
  lines.push(`Overall Result: ${failCount === 0 && !errorMsg ? "PASS (100%)" : `FAIL (${errorMsg || "See failed step"})`}`);
  lines.push("================================================================================\n");

  let currentSection = "";
  for (const item of logs) {
    if (item.section !== currentSection) {
      currentSection = item.section;
      lines.push(`\n--------------------------------------------------------------------------------`);
      lines.push(`SECTION: ${currentSection}`);
      lines.push(`--------------------------------------------------------------------------------`);
    }
    lines.push(
      `[#${String(item.index).padStart(2, "0")}] [${item.passed ? "PASS" : "FAIL"}] ${item.method} ${item.path}`,
    );
    lines.push(`  Description : ${item.description}`);
    lines.push(`  Timestamp   : ${item.timestamp}`);
    lines.push(`  HTTP Status : ${item.status} (Expected: ${item.expectedStatus}) | Duration: ${item.durationMs} ms`);
    if (item.requestBody !== null) {
      const safeReq = { ...item.requestBody };
      if (safeReq.password) safeReq.password = "***";
      lines.push(`  Request     : ${truncateJson(safeReq, 400)}`);
    }
    lines.push(`  Response    : ${item.responsePreview}`);
    lines.push("");
  }

  fs.writeFileSync(LOG_TXT_PATH, lines.join("\n"), "utf8");
  console.log(`\nLog file generated at: ${LOG_TXT_PATH}`);
}

async function main() {
  const runStartedAt = new Date().toISOString();
  const ts = Date.now();

  try {
    const { TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD, TEST_PROVIDER_USERNAME, TEST_PROVIDER_PASSWORD } = process.env;
    if (!BASE_URL) {
      throw new Error("Set TEST_API_BASE_URL to a dedicated test backend before running the live API test.");
    }
    if (!TEST_ADMIN_USERNAME || !TEST_ADMIN_PASSWORD || !TEST_PROVIDER_USERNAME || !TEST_PROVIDER_PASSWORD) {
      throw new Error("Set TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD, TEST_PROVIDER_USERNAME and TEST_PROVIDER_PASSWORD before running the live API test.");
    }
    // ================= 1. AUTH ENDPOINTS =================
    const s1 = "1. AUTH ENDPOINTS";

    const adminLogin = await req(s1, "Login as Admin demo account", "POST", "/auth/login", {
      body: { username: TEST_ADMIN_USERNAME, password: TEST_ADMIN_PASSWORD },
      expectedStatus: 200,
    });
    const adminToken = adminLogin.data.token;

    const providerLogin = await req(s1, "Login as Provider demo account", "POST", "/auth/login", {
      body: { username: TEST_PROVIDER_USERNAME, password: TEST_PROVIDER_PASSWORD },
      expectedStatus: 200,
    });
    const providerToken = providerLogin.data.token;

    const tempPhotogEmail = `test.photog.${ts}@filmbooking.local`;
    await req(s1, "Register new Photographer account", "POST", "/auth/register/photographer", {
      body: {
        fullName: "API Test Photographer",
        username: `test.photog.${ts}`,
        email: tempPhotogEmail,
        password: "Password123!",
      },
      expectedStatus: 201,
    });

    const tempRegProvEmail = `test.regprov.${ts}@filmbooking.local`;
    await req(s1, "Register new Provider account (Pending approval)", "POST", "/auth/register/provider", {
      body: {
        fullName: "API Test Reg Provider",
        username: `test.regprov.${ts}`,
        email: tempRegProvEmail,
        password: "Password123!",
        businessName: `API Test Reg Studio ${ts}`,
        description: "Temporary registered provider",
        address: "123 Nguyen Hue, HCMC",
        phone: "0901112233",
      },
      expectedStatus: 201,
    });

    // ================= 2. ADMIN ENDPOINTS =================
    const s2 = "2. ADMIN ENDPOINTS";

    await req(s2, "Get Admin dashboard statistics", "GET", "/admin/dashboard", {
      token: adminToken,
      expectedStatus: 200,
    });

    await req(s2, "List Admin users (paginated)", "GET", "/admin/users?page=1&pageSize=10", {
      token: adminToken,
      expectedStatus: 200,
    });

    const tempUserEmail = `test.adminuser.${ts}@filmbooking.local`;
    const createdUser = await req(s2, "Create user via Admin API", "POST", "/admin/users", {
      token: adminToken,
      body: {
        fullName: "Temp Admin Created User",
        username: `test.adminuser.${ts}`,
        email: tempUserEmail,
        password: "Password123!",
        role: "PHOTOGRAPHER",
        status: "ACTIVE",
      },
      expectedStatus: 201,
    });
    const tempUserId = createdUser.data.userId;

    await req(s2, "Get Admin user details by ID", "GET", `/admin/users/${tempUserId}`, {
      token: adminToken,
      expectedStatus: 200,
    });

    await req(s2, "Update Admin user profile & role", "PUT", `/admin/users/${tempUserId}`, {
      token: adminToken,
      body: {
        fullName: "Temp Admin User Updated",
        username: `test.adminuser.${ts}`,
        email: tempUserEmail,
        role: "PHOTOGRAPHER",
        status: "ACTIVE",
      },
      expectedStatus: 200,
    });

    await req(s2, "Toggle Admin user status (ACTIVE -> INACTIVE)", "PATCH", `/admin/users/${tempUserId}/status`, {
      token: adminToken,
      body: { status: "INACTIVE" },
      expectedStatus: 200,
    });

    await req(s2, "Delete Admin user by ID", "DELETE", `/admin/users/${tempUserId}`, {
      token: adminToken,
      expectedStatus: 204,
    });

    // Cleanup registered test accounts
    const allProvsForCleanup = await req(s2, "List all Admin providers", "GET", "/admin/providers?page=1&pageSize=100", {
      token: adminToken,
      expectedStatus: 200,
    });
    for (const p of allProvsForCleanup.data.items) {
      if (p.email.toLowerCase() === tempRegProvEmail.toLowerCase()) {
        await req(s2, `Cleanup temporary provider (${p.email})`, "DELETE", `/admin/providers/${p.providerId}`, {
          token: adminToken,
          expectedStatus: [204, 404],
        });
      }
    }
    const allUsersForCleanup = await req(s2, "List Admin users for cleanup", "GET", "/admin/users?page=1&pageSize=100", {
      token: adminToken,
      expectedStatus: 200,
    });
    for (const u of allUsersForCleanup.data.items) {
      const em = u.email.toLowerCase();
      if (
        em === tempPhotogEmail.toLowerCase() ||
        em === tempRegProvEmail.toLowerCase()
      ) {
        await req(s2, `Cleanup temporary user (${u.email})`, "DELETE", `/admin/users/${u.userId}`, {
          token: adminToken,
          expectedStatus: [204, 404],
        });
      }
    }

    const tempAdminProvEmail = `test.adminprov.${ts}@filmbooking.local`;
    const createdProv = await req(s2, "Create Provider via Admin API", "POST", "/admin/providers", {
      token: adminToken,
      body: {
        fullName: "Temp Admin Provider Owner",
        username: `test.adminprov.${ts}`,
        email: tempAdminProvEmail,
        password: "Password123!",
        businessName: `Temp Admin Provider ${ts}`,
        description: "Created by Admin API test",
        address: "456 Le Loi, HCMC",
        phone: "0909998877",
      },
      expectedStatus: 201,
    });
    const tempProviderId = createdProv.data.providerId;

    await req(s2, "Get Admin provider details by ID", "GET", `/admin/providers/${tempProviderId}`, {
      token: adminToken,
      expectedStatus: 200,
    });

    await req(s2, "Update Admin provider business profile", "PUT", `/admin/providers/${tempProviderId}`, {
      token: adminToken,
      body: {
        businessName: `Temp Admin Provider Updated ${ts}`,
        description: "Updated by Admin API test",
        address: "789 Dong Khoi, HCMC",
        phone: "0909998877",
      },
      expectedStatus: 200,
    });

    await req(s2, "Approve provider account via Admin API", "PATCH", `/admin/providers/${tempProviderId}/approval`, {
      token: adminToken,
      body: { approvalStatus: "APPROVED" },
      expectedStatus: 200,
    });

    await req(s2, "List Admin creative spaces", "GET", "/admin/spaces?page=1&pageSize=10", {
      token: adminToken,
      expectedStatus: 200,
    });

    const createdAdminSpace = await req(s2, "Create creative space via Admin API", "POST", "/admin/spaces", {
      token: adminToken,
      body: {
        providerId: tempProviderId,
        name: `Temp Admin Space ${ts}`,
        type: "STUDIO",
        description: "Created by Admin Space API test",
        address: "789 Dong Khoi, HCMC",
        capacity: 10,
        status: "INACTIVE",
      },
      expectedStatus: 201,
    });
    const tempAdminSpaceId = createdAdminSpace.data.spaceId;

    await req(s2, "Get Admin creative space details by ID", "GET", `/admin/spaces/${tempAdminSpaceId}`, {
      token: adminToken,
      expectedStatus: 200,
    });

    await req(s2, "Update Admin creative space", "PUT", `/admin/spaces/${tempAdminSpaceId}`, {
      token: adminToken,
      body: {
        providerId: tempProviderId,
        name: `Temp Admin Space Updated ${ts}`,
        type: "STUDIO",
        description: "Updated by Admin Space API test",
        address: "789 Dong Khoi, HCMC",
        capacity: 12,
        status: "INACTIVE",
      },
      expectedStatus: 200,
    });

    await req(s2, "Update Admin creative space status (PATCH status)", "PATCH", `/admin/spaces/${tempAdminSpaceId}/status`, {
      token: adminToken,
      body: { status: "ACTIVE" },
      expectedStatus: 200,
    });

    await req(s2, "Delete Admin creative space", "DELETE", `/admin/spaces/${tempAdminSpaceId}`, {
      token: adminToken,
      expectedStatus: 204,
    });

    await req(s2, "Delete Admin provider", "DELETE", `/admin/providers/${tempProviderId}`, {
      token: adminToken,
      expectedStatus: 204,
    });

    const adminBookings = await req(s2, "List Admin bookings / transactions", "GET", "/admin/bookings?page=1&pageSize=10", {
      token: adminToken,
      expectedStatus: 200,
    });
    if (adminBookings.data.items.length > 0) {
      const firstBookingId = adminBookings.data.items[0].bookingId;
      await req(s2, "Get Admin booking detail by ID", "GET", `/admin/bookings/${firstBookingId}`, {
        token: adminToken,
        expectedStatus: 200,
      });
    }
    await req(
      s2,
      "Verify Admin mark booking No-Show endpoint contract",
      "PATCH",
      "/admin/bookings/00000000-0000-0000-0000-000000000000/no-show",
      {
        token: adminToken,
        body: { staffNote: "Contract verification test" },
        expectedStatus: 404,
      },
    );

    // ================= 3. PROVIDER ENDPOINTS =================
    const s3 = "3. PROVIDER ENDPOINTS";

    const provAccount = await req(s3, "Get Provider business account profile", "GET", "/provider/account", {
      token: providerToken,
      expectedStatus: 200,
    });

    await req(s3, "Update Provider business account profile", "PUT", "/provider/account", {
      token: providerToken,
      body: {
        businessName: provAccount.data.businessName,
        businessDescription: provAccount.data.businessDescription,
        businessAddress: provAccount.data.businessAddress,
        businessPhone: provAccount.data.businessPhone,
      },
      expectedStatus: 200,
    });

    await req(s3, "Get Provider Dashboard analytics & utilization metrics", "GET", "/provider/dashboard", {
      token: providerToken,
      expectedStatus: 200,
    });

    await req(s3, "List Provider creative spaces", "GET", "/provider/spaces?page=1&pageSize=20", {
      token: providerToken,
      expectedStatus: 200,
    });

    const createdDarkroom = await req(s3, "Create Provider Darkroom space", "POST", "/provider/spaces", {
      token: providerToken,
      body: {
        name: `Temp Provider Darkroom ${ts}`,
        type: "DARKROOM",
        description: "Temporary darkroom for full API verification",
        address: "101 Pasteur, HCMC",
        capacity: 4,
        status: "ACTIVE",
      },
      expectedStatus: 201,
    });
    const darkroomId = createdDarkroom.data.spaceId;

    await req(s3, "Get Provider creative space details by ID", "GET", `/provider/spaces/${darkroomId}`, {
      token: providerToken,
      expectedStatus: 200,
    });

    await req(s3, "Update Provider creative space", "PUT", `/provider/spaces/${darkroomId}`, {
      token: providerToken,
      body: {
        name: `Temp Provider Darkroom Updated ${ts}`,
        type: "DARKROOM",
        description: "Updated temporary darkroom",
        address: "101 Pasteur, HCMC",
        capacity: 5,
        status: "ACTIVE",
      },
      expectedStatus: 200,
    });

    const addedImg = await req(s3, "Add image URL to Provider creative space", "POST", `/provider/spaces/${darkroomId}/images`, {
      token: providerToken,
      body: { imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32" },
      expectedStatus: 201,
    });

    await req(s3, "Delete image from Provider creative space", "DELETE", `/provider/spaces/${darkroomId}/images/${addedImg.data.imageId}`, {
      token: providerToken,
      expectedStatus: 204,
    });

    const addedAvail = await req(s3, "Create availability slot for Provider space", "POST", `/provider/spaces/${darkroomId}/availability`, {
      token: providerToken,
      body: {
        availableDate: "2026-12-20",
        startTime: "09:00:00",
        endTime: "12:00:00",
        status: "AVAILABLE",
        price: 500000,
      },
      expectedStatus: 201,
    });
    const availId = addedAvail.data.availabilityId;

    await req(s3, "List availability slots for Provider space", "GET", `/provider/spaces/${darkroomId}/availability`, {
      token: providerToken,
      expectedStatus: 200,
    });

    await req(s3, "Update availability slot for Provider space", "PUT", `/provider/spaces/${darkroomId}/availability/${availId}`, {
      token: providerToken,
      body: {
        availableDate: "2026-12-20",
        startTime: "10:00:00",
        endTime: "13:00:00",
        status: "AVAILABLE",
        price: 550000,
      },
      expectedStatus: 200,
    });

    await req(s3, "Delete availability slot from Provider space", "DELETE", `/provider/spaces/${darkroomId}/availability/${availId}`, {
      token: providerToken,
      expectedStatus: 204,
    });

    await req(s3, "List Provider equipment catalogue", "GET", "/provider/equipment?page=1&pageSize=10", {
      token: providerToken,
      expectedStatus: 200,
    });

    const createdEq = await req(s3, "Create Provider equipment", "POST", "/provider/equipment", {
      token: providerToken,
      body: {
        spaceId: darkroomId,
        name: `Temp Enlarger ${ts}`,
        category: "Enlarger",
        equipmentType: "DARKROOM",
        variant: "Beseler 23C III",
        description: "Temporary enlarger for API test",
        quantityTotal: 2,
        rentalPrice: 200000,
        conditionStatus: "GOOD",
        conditionNote: null,
        lastCheckedAt: new Date().toISOString(),
        status: "ACTIVE",
        statusNote: null,
      },
      expectedStatus: 201,
    });
    const eqId = createdEq.data.equipmentId;

    await req(s3, "Get Provider equipment detail by ID", "GET", `/provider/equipment/${eqId}`, {
      token: providerToken,
      expectedStatus: 200,
    });

    await req(s3, "Update Provider equipment", "PUT", `/provider/equipment/${eqId}`, {
      token: providerToken,
      body: {
        name: `Temp Enlarger Updated ${ts}`,
        category: "Enlarger",
        equipmentType: "DARKROOM",
        variant: "Beseler 23C III-XL",
        description: "Updated enlarger",
        quantityTotal: 3,
        rentalPrice: 250000,
        conditionStatus: "GOOD",
        conditionNote: "Checked OK",
        lastCheckedAt: new Date().toISOString(),
        status: "ACTIVE",
        statusNote: null,
      },
      expectedStatus: 200,
    });

    await req(s3, "List Provider equipment availability", "GET", `/provider/equipment/${eqId}/availability`, {
      token: providerToken,
      expectedStatus: 200,
    });

    const createdEqAvail = await req(s3, "Create Provider equipment availability slot", "POST", `/provider/equipment/${eqId}/availability`, {
      token: providerToken,
      body: {
        availableDate: "2026-12-31",
        startTime: "09:00:00",
        endTime: "17:00:00",
        status: "AVAILABLE",
        price: 300000,
      },
      expectedStatus: [200, 201],
    });
    const eqAvailId = createdEqAvail.data?.availabilityId || createdEqAvail.data?.id;

    if (eqAvailId) {
      await req(s3, "Update Provider equipment availability slot", "PUT", `/provider/equipment/${eqId}/availability/${eqAvailId}`, {
        token: providerToken,
        body: {
          availableDate: "2026-12-31",
          startTime: "09:00:00",
          endTime: "18:00:00",
          status: "AVAILABLE",
          price: 350000,
        },
        expectedStatus: [200, 204],
      });

      await req(s3, "Delete Provider equipment availability slot", "DELETE", `/provider/equipment/${eqId}/availability/${eqAvailId}`, {
        token: providerToken,
        expectedStatus: [200, 204],
      });
    }

    await req(s3, "List Provider darkroom chemicals", "GET", "/provider/chemicals?page=1&pageSize=20", {
      token: providerToken,
      expectedStatus: 200,
    });

    const createdChem = await req(s3, "Create Provider darkroom chemical", "POST", "/provider/chemicals", {
      token: providerToken,
      body: {
        darkroomId,
        name: `Temp Ilford ID-11 ${ts}`,
        chemicalType: "DEVELOPER",
        brand: "Ilford",
        stockQuantity: 4,
        stockUnit: "L",
        minimumStock: 1,
        unitCost: 300000,
        unitSellingPrice: 350000,
        expiresOn: "2027-06-30",
        status: "ACTIVE",
        statusNote: null,
      },
      expectedStatus: 201,
    });
    const chemId = createdChem.data.chemicalId;

    await req(s3, "Get Provider darkroom chemical detail by ID", "GET", `/provider/chemicals/${chemId}`, {
      token: providerToken,
      expectedStatus: 200,
    });

    await req(s3, "Update Provider darkroom chemical", "PUT", `/provider/chemicals/${chemId}`, {
      token: providerToken,
      body: {
        name: `Temp Ilford ID-11 Updated ${ts}`,
        chemicalType: "DEVELOPER",
        brand: "Ilford",
        stockQuantity: 5,
        stockUnit: "L",
        minimumStock: 1.5,
        unitCost: 320000,
        unitSellingPrice: 370000,
        expiresOn: "2027-06-30",
        status: "ACTIVE",
        statusNote: null,
      },
      expectedStatus: 200,
    });

    await req(s3, "Adjust chemical stock (+1 PURCHASE movement)", "POST", `/provider/chemicals/${chemId}/stock-adjustments`, {
      token: providerToken,
      body: {
        movementType: "PURCHASE",
        quantityDelta: 1,
        unitCost: 300000,
        supplierOrReference: "PO-VERIFY-1",
        note: "Added 1 unit in API test",
      },
      expectedStatus: 200,
    });
    await req(s3, "Adjust chemical stock (-1 ADJUSTMENT revert)", "POST", `/provider/chemicals/${chemId}/stock-adjustments`, {
      token: providerToken,
      body: {
        movementType: "ADJUSTMENT",
        quantityDelta: -1,
        unitCost: null,
        supplierOrReference: "PO-VERIFY-1-REVERT",
        note: "Reverted 1 unit in API test",
      },
      expectedStatus: 200,
    });

    await req(s3, "List Provider maintenance schedules", "GET", "/provider/maintenance?page=1&pageSize=10", {
      token: providerToken,
      expectedStatus: 200,
    });

    const createdMaint = await req(s3, "Create Provider maintenance schedule", "POST", "/provider/maintenance", {
      token: providerToken,
      body: {
        studioId: null,
        darkroomId: null,
        equipmentId: eqId,
        maintenanceDate: new Date().toISOString(),
        description: "Routine alignment check",
        repairNote: "Initial inspection",
        status: "SCHEDULED",
        cost: 100000,
      },
      expectedStatus: 201,
    });
    const maintId = createdMaint.data.maintenanceId;

    await req(s3, "Get Provider maintenance detail by ID", "GET", `/provider/maintenance/${maintId}`, {
      token: providerToken,
      expectedStatus: 200,
    });

    await req(s3, "Update Provider maintenance schedule to COMPLETED", "PUT", `/provider/maintenance/${maintId}`, {
      token: providerToken,
      body: {
        maintenanceDate: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        description: "Routine alignment check completed",
        repairNote: "Lens stage calibrated",
        status: "COMPLETED",
        cost: 120000,
      },
      expectedStatus: 200,
    });

    await req(s3, "Delete Provider maintenance schedule", "DELETE", `/provider/maintenance/${maintId}`, {
      token: providerToken,
      expectedStatus: 204,
    });

    await req(s3, "List Provider standalone services", "GET", "/provider/services?page=1&pageSize=10", {
      token: providerToken,
      expectedStatus: 200,
    });

    const createdSvc = await req(s3, "Create Provider standalone service", "POST", "/provider/services", {
      token: providerToken,
      body: {
        name: `Temp B&W Film Push Processing ${ts}`,
        description: "+1 to +3 stop push processing",
        price: 150000,
        status: "ACTIVE",
      },
      expectedStatus: 201,
    });
    const svcId = createdSvc.data.serviceId;

    await req(s3, "Get Provider standalone service detail by ID", "GET", `/provider/services/${svcId}`, {
      token: providerToken,
      expectedStatus: 200,
    });

    await req(s3, "Update Provider standalone service", "PUT", `/provider/services/${svcId}`, {
      token: providerToken,
      body: {
        name: `Temp B&W Film Push Processing Updated ${ts}`,
        description: "Updated push processing service",
        price: 175000,
        status: "ACTIVE",
      },
      expectedStatus: 200,
    });

    await req(s3, "List Provider service packages", "GET", "/provider/service-packages?page=1&pageSize=10", {
      token: providerToken,
      expectedStatus: 200,
    });

    const createdPkg = await req(s3, "Create Provider service package", "POST", "/provider/service-packages", {
      token: providerToken,
      body: {
        name: `Temp Complete Analog Pass ${ts}`,
        description: "Temporary package testing package items",
        price: 2500000,
        usesPerMonth: 4,
        validityMonths: 1,
        status: "ACTIVE",
      },
      expectedStatus: 201,
    });
    const pkgId = createdPkg.data.packageId;

    await req(s3, "Get Provider service package detail by ID", "GET", `/provider/service-packages/${pkgId}`, {
      token: providerToken,
      expectedStatus: 200,
    });

    await req(s3, "Update Provider service package", "PUT", `/provider/service-packages/${pkgId}`, {
      token: providerToken,
      body: {
        name: `Temp Complete Analog Pass Updated ${ts}`,
        description: "Updated temporary package",
        price: 2600000,
        usesPerMonth: 5,
        validityMonths: 2,
        status: "ACTIVE",
      },
      expectedStatus: 200,
    });

    const item1 = await req(s3, "Attach DARKROOM item to Service Package", "POST", `/provider/service-packages/${pkgId}/items`, {
      token: providerToken,
      body: {
        componentType: "DARKROOM",
        resourceId: darkroomId,
        quantity: 1,
        stepOrder: 1,
        includedDurationMinutes: 180,
        includedChemicalQuantity: null,
        notes: "3 hours darkroom session",
      },
      expectedStatus: 201,
    });
    const item2 = await req(s3, "Attach EQUIPMENT item to Service Package", "POST", `/provider/service-packages/${pkgId}/items`, {
      token: providerToken,
      body: {
        componentType: "EQUIPMENT",
        resourceId: eqId,
        quantity: 1,
        stepOrder: 2,
        includedDurationMinutes: 180,
        includedChemicalQuantity: null,
        notes: "Includes enlarger",
      },
      expectedStatus: 201,
    });
    const item3 = await req(s3, "Attach CHEMICAL item to Service Package", "POST", `/provider/service-packages/${pkgId}/items`, {
      token: providerToken,
      body: {
        componentType: "CHEMICAL",
        resourceId: chemId,
        quantity: 1,
        stepOrder: 3,
        includedDurationMinutes: null,
        includedChemicalQuantity: 0.5,
        notes: "Includes 0.5L developer",
      },
      expectedStatus: 201,
    });
    const item4 = await req(s3, "Attach SERVICE item to Service Package", "POST", `/provider/service-packages/${pkgId}/items`, {
      token: providerToken,
      body: {
        componentType: "SERVICE",
        resourceId: svcId,
        quantity: 1,
        stepOrder: 4,
        includedDurationMinutes: null,
        includedChemicalQuantity: null,
        notes: "Includes push processing service",
      },
      expectedStatus: 201,
    });

    await req(s3, "List attached items of Service Package", "GET", `/provider/service-packages/${pkgId}/items`, {
      token: providerToken,
      expectedStatus: 200,
    });

    for (const [idx, it] of [item1, item2, item3, item4].entries()) {
      await req(
        s3,
        `Remove package item #${idx + 1} (${it.data.componentType}) from Service Package`,
        "DELETE",
        `/provider/service-packages/${pkgId}/items/${it.data.packageItemId}`,
        { token: providerToken, expectedStatus: 204 },
      );
    }

    await req(s3, "Delete Provider service package", "DELETE", `/provider/service-packages/${pkgId}`, {
      token: providerToken,
      expectedStatus: 204,
    });
    await req(s3, "Delete Provider standalone service", "DELETE", `/provider/services/${svcId}`, {
      token: providerToken,
      expectedStatus: 204,
    });
    await req(s3, "Delete Provider darkroom chemical", "DELETE", `/provider/chemicals/${chemId}`, {
      token: providerToken,
      expectedStatus: 204,
    });
    await req(s3, "Delete Provider equipment", "DELETE", `/provider/equipment/${eqId}`, {
      token: providerToken,
      expectedStatus: 204,
    });
    await req(s3, "Delete Provider Darkroom space", "DELETE", `/provider/spaces/${darkroomId}`, {
      token: providerToken,
      expectedStatus: 204,
    });

    const provBookings = await req(s3, "List Provider bookings", "GET", "/provider/bookings?page=1&pageSize=10", {
      token: providerToken,
      expectedStatus: 200,
    });
    if (provBookings.data.items.length > 0) {
      const firstBkId = provBookings.data.items[0].bookingId;
      await req(s3, "Get Provider booking detail by ID", "GET", `/provider/bookings/${firstBkId}`, {
        token: providerToken,
        expectedStatus: 200,
      });
      await req(s3, "List resource allocations for Provider booking", "GET", `/provider/bookings/${firstBkId}/allocations`, {
        token: providerToken,
        expectedStatus: 200,
      });
    }
    await req(
      s3,
      "Verify Provider booking schedule reallocation endpoint contract",
      "PATCH",
      "/provider/bookings/11111111-1111-1111-1111-111111111111/allocations/11111111-1111-1111-1111-111111111111",
      {
        token: providerToken,
        body: { availabilityId: "11111111-1111-1111-1111-111111111111" },
        expectedStatus: 404,
      },
    );

    writeLogFiles(runStartedAt);
    console.log("\nALL LIVE API TESTS PASSED SUCCESSFULLY!");
  } catch (err) {
    writeLogFiles(runStartedAt, err.message);
    console.error("\nAPI TEST FAILED:", err.message);
    process.exit(1);
  }
}

main();
