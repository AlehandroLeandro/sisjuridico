import { http, HttpResponse } from "msw";
import type { MockUser } from "./fixtures";
import {
  contractExtensions,
  contracts,
  documents,
  eventos,
  lawsuits,
  lawyers,
  people,
  users,
} from "./fixtures";
import { matchesText, nextId, paginate } from "./paginate";
import { issueTokens, publicUser, refreshAccessToken, revokeRefreshToken, userFromAuthHeader } from "./session";
import { NATURE_LABELS } from "../shared/enums/labels";

type Role = MockUser["role"];

function auth(request: Request, roles?: Role[]): { user: MockUser } | { error: HttpResponse<Record<string, unknown>> } {
  const user = userFromAuthHeader(request.headers.get("Authorization"));
  if (!user) return { error: HttpResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  if (roles && !roles.includes(user.role)) {
    return { error: HttpResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

function withinDays(dateStr: string | null, days: number): boolean {
  if (!dateStr) return false;
  const diff = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}

export const handlers = [
  // ---------- Auth ----------
  http.post("/auth/login", async ({ request }) => {
    const body = (await request.json()) as { userName: string; password: string };
    const user = users.find((u) => u.userName === body.userName && u.password === body.password);
    if (!user) return HttpResponse.json({ message: "Credenciais inválidas" }, { status: 401 });
    const tokens = issueTokens(user);
    return HttpResponse.json({ ...tokens, tokenType: "Bearer", user: publicUser(user) }, { status: 200 });
  }),

  http.post("/auth/refresh", async ({ request }) => {
    const body = (await request.json()) as { refreshToken: string };
    const result = refreshAccessToken(body.refreshToken);
    if (!result) return HttpResponse.json({ message: "Refresh token inválido" }, { status: 401 });
    return HttpResponse.json({ ...result, tokenType: "Bearer" });
  }),

  http.post("/auth/logout", async ({ request }) => {
    const gate = auth(request, ["ADMIN", "USER"]); // ACCOUNTING blocked here per AD-006 — replicated intentionally
    if ("error" in gate) return gate.error;
    const body = (await request.json()) as { refreshToken: string };
    revokeRefreshToken(body.refreshToken);
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch("/auth/change-password", async ({ request }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    return new HttpResponse(null, { status: 204 });
  }),

  // ---------- People ----------
  http.get("/people", ({ request }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const url = new URL(request.url);
    const filtered = people.filter(
      (p) => matchesText(p.name, url.searchParams.get("name")) && matchesText(p.cpfCnpj, url.searchParams.get("cpfCnpj")),
    );
    return HttpResponse.json(paginate(filtered, url.searchParams.get("page"), url.searchParams.get("size")));
  }),
  http.get("/people/:id", ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const found = people.find((p) => p.id === Number(params.id));
    if (!found) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(found);
  }),
  http.post("/people", async ({ request }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const body = (await request.json()) as { name: string; cpfCnpj?: string };
    const created = { id: nextId(), name: body.name, cpfCnpj: body.cpfCnpj ?? null };
    people.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.patch("/people/:id", async ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const idx = people.findIndex((p) => p.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const body = (await request.json()) as Partial<{ name: string; cpfCnpj: string }>;
    people[idx] = { ...people[idx], ...body };
    return HttpResponse.json(people[idx]);
  }),
  http.delete("/people/:id", ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const idx = people.findIndex((p) => p.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    people.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ---------- Lawyers ----------
  http.get("/lawyers", ({ request }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const url = new URL(request.url);
    const filtered = lawyers.filter(
      (l) =>
        matchesText(l.name, url.searchParams.get("name")) &&
        matchesText(l.cpfCnpj, url.searchParams.get("cpfCnpj")) &&
        matchesText(l.oab, url.searchParams.get("oab")),
    );
    return HttpResponse.json(paginate(filtered, url.searchParams.get("page"), url.searchParams.get("size")));
  }),
  http.get("/lawyers/:id", ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const found = lawyers.find((l) => l.id === Number(params.id));
    if (!found) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(found);
  }),
  http.post("/lawyers", async ({ request }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const body = (await request.json()) as { name: string; cpfCnpj?: string; oab?: string };
    const created = { id: nextId(), name: body.name, cpfCnpj: body.cpfCnpj ?? null, oab: body.oab ?? null };
    lawyers.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.patch("/lawyers/:id", async ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const idx = lawyers.findIndex((l) => l.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const body = (await request.json()) as Partial<{ name: string; cpfCnpj: string; oab: string }>;
    lawyers[idx] = { ...lawyers[idx], ...body };
    return HttpResponse.json(lawyers[idx]);
  }),
  http.delete("/lawyers/:id", ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const idx = lawyers.findIndex((l) => l.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    lawyers.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ---------- Lawsuits ----------
  http.get("/lawsuits", ({ request }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const url = new URL(request.url);
    const q = url.searchParams;
    const filtered = lawsuits.filter((l) => {
      if (q.get("numProcesso") && String(l.numProcesso) !== q.get("numProcesso")) return false;
      if (q.get("personId") && String(l.personId) !== q.get("personId")) return false;
      if (q.get("lawyerId") && String(l.lawyerId) !== q.get("lawyerId")) return false;
      if (q.get("rit") && l.rit !== q.get("rit")) return false;
      if (q.get("court") && l.court !== q.get("court")) return false;
      if (q.get("nature") && l.nature !== q.get("nature")) return false;
      if (q.get("action") && l.action !== q.get("action")) return false;
      if (q.get("initialOrganization") && l.initialOrganization !== q.get("initialOrganization")) return false;
      if (q.get("positionClient") && l.positionClient !== q.get("positionClient")) return false;
      return true;
    });
    return HttpResponse.json(paginate(filtered, q.get("page"), q.get("size")));
  }),
  http.get("/lawsuits/:id", ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const found = lawsuits.find((l) => l.id === Number(params.id));
    if (!found) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(found);
  }),
  http.post("/lawsuits", async ({ request }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const body = (await request.json()) as Omit<(typeof lawsuits)[number], "id">;
    const created = { id: nextId(), ...body };
    lawsuits.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.patch("/lawsuits/:id", async ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const idx = lawsuits.findIndex((l) => l.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const body = (await request.json()) as Partial<(typeof lawsuits)[number]>;
    lawsuits[idx] = { ...lawsuits[idx], ...body };
    return HttpResponse.json(lawsuits[idx]);
  }),
  http.put("/lawsuits/:id", async ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const idx = lawsuits.findIndex((l) => l.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const body = (await request.json()) as Omit<(typeof lawsuits)[number], "id">;
    lawsuits[idx] = { id: lawsuits[idx].id, ...body };
    return HttpResponse.json(lawsuits[idx]);
  }),
  http.delete("/lawsuits/:id", ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const idx = lawsuits.findIndex((l) => l.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    lawsuits.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ---------- Contracts ----------
  http.get("/contracts", ({ request }) => {
    const gate = auth(request, ["ADMIN", "USER", "ACCOUNTING"]);
    if ("error" in gate) return gate.error;
    const url = new URL(request.url);
    const q = url.searchParams;
    const filtered = contracts.filter((c) => {
      if (q.get("active") !== null && String(c.active) !== q.get("active")) return false;
      if (q.get("typeContract") && c.typeContract !== q.get("typeContract")) return false;
      if (q.get("contractorId") && String(c.contractorId) !== q.get("contractorId")) return false;
      if (q.get("contractedId") && String(c.contractedId) !== q.get("contractedId")) return false;
      return true;
    });
    return HttpResponse.json(paginate(filtered, q.get("page"), q.get("size")));
  }),
  http.get("/contracts/:id", ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER", "ACCOUNTING"]);
    if ("error" in gate) return gate.error;
    const found = contracts.find((c) => c.id === Number(params.id));
    if (!found) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(found);
  }),
  http.post("/contracts", async ({ request }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const body = (await request.json()) as Omit<(typeof contracts)[number], "id" | "originalEndDate">;
    const created = { id: nextId(), originalEndDate: body.endDate, ...body };
    contracts.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.patch("/contracts/:id", async ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const idx = contracts.findIndex((c) => c.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const body = (await request.json()) as Partial<(typeof contracts)[number]>;
    contracts[idx] = { ...contracts[idx], ...body };
    return HttpResponse.json(contracts[idx]);
  }),
  http.delete("/contracts/:id", ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const idx = contracts.findIndex((c) => c.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    contracts.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
  http.get("/contracts/:id/extensions", ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER", "ACCOUNTING"]);
    if ("error" in gate) return gate.error;
    const list = contractExtensions.filter((e) => e.contractId === Number(params.id));
    return HttpResponse.json(list);
  }),
  http.post("/contracts/:id/extensions", async ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const contract = contracts.find((c) => c.id === Number(params.id));
    if (!contract) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const body = (await request.json()) as { newEndDate: string; obs?: string };
    const previousEndDate = contract.endDate ?? contract.startDate;
    if (new Date(body.newEndDate) <= new Date(previousEndDate)) {
      return HttpResponse.json({ message: "newEndDate must be after previousEndDate" }, { status: 400 });
    }
    const created = {
      id: nextId(),
      contractId: contract.id,
      previousEndDate,
      newEndDate: body.newEndDate,
      extendedAt: new Date().toISOString(),
      obs: body.obs ?? null,
    };
    contractExtensions.push(created);
    contract.endDate = body.newEndDate;
    return HttpResponse.json(created, { status: 201 });
  }),

  // ---------- Documents ----------
  http.get("/documents", ({ request }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const url = new URL(request.url);
    const q = url.searchParams;
    const filtered = documents.filter((d) => {
      if (!matchesText(d.fileName, q.get("fileName"))) return false;
      if (q.get("contentType") && d.contentType !== q.get("contentType")) return false;
      if (q.get("contractId") && String(d.contractId) !== q.get("contractId")) return false;
      if (q.get("lawsuitId") && String(d.lawsuitId) !== q.get("lawsuitId")) return false;
      return true;
    });
    const sorted = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return HttpResponse.json(paginate(sorted, q.get("page"), q.get("size")));
  }),
  http.get("/documents/:id", ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const found = documents.find((d) => d.id === Number(params.id));
    if (!found) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(found);
  }),
  http.post("/documents", async ({ request }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const contractId = form.get("contractId") ? Number(form.get("contractId")) : null;
    const lawsuitId = form.get("lawsuitId") ? Number(form.get("lawsuitId")) : null;
    if ((contractId === null) === (lawsuitId === null)) {
      return HttpResponse.json({ message: "Exactly one of contractId/lawsuitId is required" }, { status: 400 });
    }
    if (!file) return HttpResponse.json({ message: "file is required" }, { status: 400 });
    if (file.size > 20 * 1024 * 1024) return HttpResponse.json({ message: "File too large" }, { status: 413 });
    const fileNameOverride = form.get("fileName") as string | null;
    const created = {
      id: nextId(),
      fileName: fileNameOverride || file.name,
      contentType: file.type || "application/octet-stream",
      storagePath: `documents/${nextId()}-${file.name}`,
      contractId,
      lawsuitId,
      createdAt: new Date().toISOString(),
    };
    documents.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.get("/documents/:id/download", ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const found = documents.find((d) => d.id === Number(params.id));
    if (!found) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json({
      url: `data:${found.contentType};base64,`, // mock: empty payload, real backend returns a pre-signed URL
      expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    });
  }),
  http.patch("/documents/:id", async ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const idx = documents.findIndex((d) => d.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const body = (await request.json()) as Partial<{ fileName: string; contractId: number | null; lawsuitId: number | null }>;
    const current = documents[idx];
    const next = { ...current, ...body };
    if ("contractId" in body && body.contractId !== null && body.contractId !== undefined) next.lawsuitId = null;
    if ("lawsuitId" in body && body.lawsuitId !== null && body.lawsuitId !== undefined) next.contractId = null;
    documents[idx] = next;
    return HttpResponse.json(next);
  }),
  http.delete("/documents/:id", ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const idx = documents.findIndex((d) => d.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    documents.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ---------- Users (ADMIN only) ----------
  http.get("/users", ({ request }) => {
    const gate = auth(request, ["ADMIN"]);
    if ("error" in gate) return gate.error;
    const url = new URL(request.url);
    const q = url.searchParams;
    const filtered = users.filter(
      (u) =>
        matchesText(u.name, q.get("name")) &&
        matchesText(u.userName, q.get("userName")) &&
        (!q.get("role") || u.role === q.get("role")),
    );
    const page = paginate(filtered.map(publicUser), q.get("page"), q.get("size"));
    return HttpResponse.json(page);
  }),
  http.get("/users/:id", ({ request, params }) => {
    const gate = auth(request, ["ADMIN"]);
    if ("error" in gate) return gate.error;
    const found = users.find((u) => u.id === Number(params.id));
    if (!found) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(publicUser(found));
  }),
  http.post("/users", async ({ request }) => {
    const gate = auth(request, ["ADMIN"]);
    if ("error" in gate) return gate.error;
    const body = (await request.json()) as Omit<MockUser, "id">;
    const created: MockUser = { id: nextId(), ...body };
    users.push(created);
    return HttpResponse.json(publicUser(created), { status: 201 });
  }),
  http.patch("/users/:id", async ({ request, params }) => {
    const gate = auth(request, ["ADMIN"]);
    if ("error" in gate) return gate.error;
    const idx = users.findIndex((u) => u.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const body = (await request.json()) as Partial<Omit<MockUser, "id">>;
    const { password: _ignored, ...rest } = body; // mirrors the frontend-users spec: this endpoint's password field is intentionally unused
    users[idx] = { ...users[idx], ...rest };
    return HttpResponse.json(publicUser(users[idx]));
  }),
  http.patch("/users/:id/password", async ({ request, params }) => {
    const gate = auth(request, ["ADMIN"]);
    if ("error" in gate) return gate.error;
    const idx = users.findIndex((u) => u.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const body = (await request.json()) as { password: string };
    users[idx] = { ...users[idx], password: body.password };
    return new HttpResponse(null, { status: 204 });
  }),
  http.delete("/users/:id", ({ request, params }) => {
    const gate = auth(request, ["ADMIN"]);
    if ("error" in gate) return gate.error;
    const idx = users.findIndex((u) => u.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    users.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ---------- Eventos ----------
  http.get("/eventos", ({ request }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const filtered = eventos
      .filter((e) => (!from || e.data >= from) && (!to || e.data <= to))
      .sort((a, b) => (a.data + (a.hora ?? "99:99")).localeCompare(b.data + (b.hora ?? "99:99")));
    return HttpResponse.json(paginate(filtered, url.searchParams.get("page"), url.searchParams.get("size")));
  }),
  http.get("/eventos/:id", ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const found = eventos.find((e) => e.id === Number(params.id));
    if (!found) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(found);
  }),
  http.post("/eventos", async ({ request }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const body = (await request.json()) as Omit<(typeof eventos)[number], "id">;
    if (body.lawsuitId && body.contractId) {
      return HttpResponse.json({ message: "At most one of lawsuitId/contractId" }, { status: 400 });
    }
    const created = { id: nextId(), ...body };
    eventos.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.patch("/eventos/:id", async ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const idx = eventos.findIndex((e) => e.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const body = (await request.json()) as Partial<(typeof eventos)[number]>;
    eventos[idx] = { ...eventos[idx], ...body };
    return HttpResponse.json(eventos[idx]);
  }),
  http.delete("/eventos/:id", ({ request, params }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;
    const idx = eventos.findIndex((e) => e.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    eventos.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ---------- Dashboard ----------
  http.get("/dashboard", ({ request }) => {
    const gate = auth(request, ["ADMIN", "USER"]);
    if ("error" in gate) return gate.error;

    const activeLawsuits = lawsuits.length;
    const activeContracts = contracts.filter((c) => c.active).length;
    const expiringSoon = contracts.filter((c) => c.active && withinDays(c.endDate, 30));

    // Every Nature value is present, even at 0 — per DASHEVT-04.
    const natureCounts = new Map<string, number>(Object.keys(NATURE_LABELS).map((n) => [n, 0]));
    for (const l of lawsuits) natureCounts.set(l.nature, (natureCounts.get(l.nature) ?? 0) + 1);

    const contratosVencendo = [...expiringSoon]
      .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
      .slice(0, 4)
      .map((c) => {
        const contratante = people.find((p) => p.id === c.contractorId);
        const days = Math.round((new Date(c.endDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return {
          contractId: c.id,
          contratante: contratante?.name ?? `Pessoa #${c.contractorId}`,
          tipo: c.typeContract,
          valor: c.value,
          diasRestantes: days,
          endDate: c.endDate,
        };
      });

    const documentosRecentes = [...documents]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4)
      .map((d) => ({ documentId: d.id, fileName: d.fileName, createdAt: d.createdAt, contractId: d.contractId, lawsuitId: d.lawsuitId }));

    const proximosEventos = [...eventos]
      .filter((e) => e.data >= new Date().toISOString().slice(0, 10))
      .sort((a, b) => (a.data + (a.hora ?? "99:99")).localeCompare(b.data + (b.hora ?? "99:99")))
      .slice(0, 5);

    return HttpResponse.json({
      kpis: {
        processosAtivos: { valor: activeLawsuits, deltaMes: 6 },
        contratosVigentes: { valor: activeContracts, deltaMes: 3 },
        contratosAVencer30d: { valor: expiringSoon.length },
      },
      contratosVencendo,
      documentosRecentes,
      distribuicaoNatureza: Array.from(natureCounts.entries()).map(([nature, count]) => ({ nature, count })),
      proximosEventos,
    });
  }),
];
