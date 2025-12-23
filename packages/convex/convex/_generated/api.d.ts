/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actors from "../actors.js";
import type * as articles from "../articles.js";
import type * as auditEntities from "../auditEntities.js";
import type * as auditLogs from "../auditLogs.js";
import type * as claimRequests from "../claimRequests.js";
import type * as claims from "../claims.js";
import type * as cleanIrrelevantEntities from "../cleanIrrelevantEntities.js";
import type * as comments from "../comments.js";
import type * as crawlers from "../crawlers.js";
import type * as createEntityConnections from "../createEntityConnections.js";
import type * as crons from "../crons.js";
import type * as entities from "../entities.js";
import type * as entityRelations from "../entityRelations.js";
import type * as events from "../events.js";
import type * as graphAnalysis from "../graphAnalysis.js";
import type * as graphExport from "../graphExport.js";
import type * as graphMetrics from "../graphMetrics.js";
import type * as http from "../http.js";
import type * as lib_openai from "../lib/openai.js";
import type * as lib_prompts from "../lib/prompts.js";
import type * as nodeReview from "../nodeReview.js";
import type * as notifications from "../notifications.js";
import type * as probableResponsibles from "../probableResponsibles.js";
import type * as seed from "../seed.js";
import type * as seedPanamaEntities from "../seedPanamaEntities.js";
import type * as snapshots from "../snapshots.js";
import type * as sources from "../sources.js";
import type * as subscriptions from "../subscriptions.js";
import type * as systemConfig from "../systemConfig.js";
import type * as topics from "../topics.js";
import type * as users from "../users.js";
import type * as verdicts from "../verdicts.js";
import type * as verification from "../verification.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  actors: typeof actors;
  articles: typeof articles;
  auditEntities: typeof auditEntities;
  auditLogs: typeof auditLogs;
  claimRequests: typeof claimRequests;
  claims: typeof claims;
  cleanIrrelevantEntities: typeof cleanIrrelevantEntities;
  comments: typeof comments;
  crawlers: typeof crawlers;
  createEntityConnections: typeof createEntityConnections;
  crons: typeof crons;
  entities: typeof entities;
  entityRelations: typeof entityRelations;
  events: typeof events;
  graphAnalysis: typeof graphAnalysis;
  graphExport: typeof graphExport;
  graphMetrics: typeof graphMetrics;
  http: typeof http;
  "lib/openai": typeof lib_openai;
  "lib/prompts": typeof lib_prompts;
  nodeReview: typeof nodeReview;
  notifications: typeof notifications;
  probableResponsibles: typeof probableResponsibles;
  seed: typeof seed;
  seedPanamaEntities: typeof seedPanamaEntities;
  snapshots: typeof snapshots;
  sources: typeof sources;
  subscriptions: typeof subscriptions;
  systemConfig: typeof systemConfig;
  topics: typeof topics;
  users: typeof users;
  verdicts: typeof verdicts;
  verification: typeof verification;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
