"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import {
  Star,
  MessageSquareText,
  Building2,
  Camera,
  Search,
  ChevronDown,
  CalendarDays,
  UserRound,
  ArrowUpRight,
} from "lucide-react";

type TabType = "rating" | "feedback";
type ResourceType = "Creative Space" | "Equipment";
type RatingStatus =
  | "All ratings"
  | "5 stars"
  | "4 stars"
  | "3 stars"
  | "2 stars"
  | "1 star";

type RatingItem = {
  id: string;
  customer: string;
  resourceName: string;
  resourceType: ResourceType;
  rating: number;
  comment: string;
  date: string;
};

type FeedbackItem = {
  id: string;
  customer: string;
  bookingId: string;
  serviceName: string;
  serviceType: ResourceType;
  rating: number;
  comment: string;
  date: string;
  status: "Reviewed" | "Pending";
};

const ratingItems: RatingItem[] = [
  {
    id: "RT-1001",
    customer: "Nguyen Minh Anh",
    resourceName: "North Light Studio",
    resourceType: "Creative Space",
    rating: 5,
    comment:
      "The lighting setup was excellent. The space was clean and perfect for our photo shoot.",
    date: "2026-10-08",
  },
  {
    id: "RT-1002",
    customer: "Tran Hoang Nam",
    resourceName: "Sony A7 IV",
    resourceType: "Equipment",
    rating: 4,
    comment: "Camera quality was great and the equipment was well maintained.",
    date: "2026-10-07",
  },
  {
    id: "RT-1003",
    customer: "Le Thu Ha",
    resourceName: "Minimal White Studio",
    resourceType: "Creative Space",
    rating: 4,
    comment:
      "Nice space with plenty of natural light. The check-in process could be smoother.",
    date: "2026-10-06",
  },
  {
    id: "RT-1004",
    customer: "Pham Quoc Bao",
    resourceName: "Godox AD600Pro",
    resourceType: "Equipment",
    rating: 3,
    comment:
      "The light worked well, but one accessory was missing when I received it.",
    date: "2026-10-05",
  },
  {
    id: "RT-1005",
    customer: "Vo Ngoc Linh",
    resourceName: "North Light Studio",
    resourceType: "Creative Space",
    rating: 5,
    comment: "Very professional environment. Would definitely book again.",
    date: "2026-10-03",
  },
];

const feedbackItems: FeedbackItem[] = [
  {
    id: "FB-1001",
    customer: "Nguyen Minh Anh",
    bookingId: "BK-2026-1081",
    serviceName: "North Light Studio",
    serviceType: "Creative Space",
    rating: 5,
    comment:
      "The booking process was smooth, and the studio was ready when we arrived.",
    date: "2026-10-08",
    status: "Reviewed",
  },
  {
    id: "FB-1002",
    customer: "Tran Hoang Nam",
    bookingId: "BK-2026-1078",
    serviceName: "Sony A7 IV",
    serviceType: "Equipment",
    rating: 4,
    comment:
      "Pickup was convenient, although the return instructions were not very clear.",
    date: "2026-10-07",
    status: "Pending",
  },
  {
    id: "FB-1003",
    customer: "Le Thu Ha",
    bookingId: "BK-2026-1072",
    serviceName: "Minimal White Studio",
    serviceType: "Creative Space",
    rating: 3,
    comment:
      "The booking was confirmed later than expected. Please improve confirmation time.",
    date: "2026-10-06",
    status: "Pending",
  },
  {
    id: "FB-1004",
    customer: "Pham Quoc Bao",
    bookingId: "BK-2026-1069",
    serviceName: "Godox AD600Pro",
    serviceType: "Equipment",
    rating: 5,
    comment:
      "Everything went as expected. The equipment was easy to collect and return.",
    date: "2026-10-04",
    status: "Reviewed",
  },
];

const fieldClassName =
  "h-10 w-full rounded-md border border-[#d8d8d1] bg-white px-3 text-sm text-[#343630] outline-none transition-colors focus:border-[#39724b] focus:ring-2 focus:ring-[#39724b]/15";

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={15}
          className={
            star <= rating ? "fill-[#e6ad42] text-[#e6ad42]" : "text-[#deded7]"
          }
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-[#343630]">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function ResourceIcon({ type }: { type: ResourceType }) {
  return type === "Creative Space" ? (
    <Building2 size={16} className="text-[#39724b]" />
  ) : (
    <Camera size={16} className="text-[#39724b]" />
  );
}

function RatingBadge({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#faf2df] px-2 py-1 text-xs font-semibold text-[#946a1e]">
      <Star size={12} className="fill-current" />
      {rating}/5
    </span>
  );
}

export default function RatingFeedbackPage() {
  const [activeTab, setActiveTab] = useState<TabType>("rating");
  const [query, setQuery] = useState("");
  const [resourceType, setResourceType] = useState("all");
  const [ratingStatus, setRatingStatus] = useState<RatingStatus>("All ratings");
  const [feedbackStatus, setFeedbackStatus] = useState("all");

  const filteredRatings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return ratingItems.filter((item) => {
      const matchesQuery =
        `${item.id} ${item.customer} ${item.resourceName} ${item.comment}`
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesType =
        resourceType === "all" || item.resourceType === resourceType;

      const matchesRating =
        ratingStatus === "All ratings" ||
        item.rating === Number(ratingStatus.charAt(0));

      return matchesQuery && matchesType && matchesRating;
    });
  }, [query, resourceType, ratingStatus]);

  const filteredFeedback = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return feedbackItems.filter((item) => {
      const matchesQuery =
        `${item.id} ${item.bookingId} ${item.customer} ${item.serviceName} ${item.comment}`
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesType =
        resourceType === "all" || item.serviceType === resourceType;

      const matchesStatus =
        feedbackStatus === "all" || item.status === feedbackStatus;

      return matchesQuery && matchesType && matchesStatus;
    });
  }, [query, resourceType, feedbackStatus]);

  const averageRating =
    ratingItems.length > 0
      ? ratingItems.reduce((sum, item) => sum + item.rating, 0) /
        ratingItems.length
      : 0;

  const fiveStarCount = ratingItems.filter((item) => item.rating === 5).length;
  const pendingFeedbackCount = feedbackItems.filter(
    (item) => item.status === "Pending",
  ).length;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setQuery("");
    setResourceType("all");
    setRatingStatus("All ratings");
    setFeedbackStatus("all");
  };

  return (
    <div className="mx-auto max-w-375 space-y-6">
      {/* Page header */}
      <PageHeader
        eyebrow="Provider workspace"
        title="Rating & Feedback"
        description="Monitor customer ratings and feedback for your resources and bookings."
      />

      {/* Summary */}
      <section
        aria-label="Rating and feedback summary"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-[#e0e0da] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#777973]">Average rating</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#faf2df]">
              <Star size={18} className="fill-[#e6ad42] text-[#e6ad42]" />
            </span>
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-2xl font-semibold text-[#20221f]">
              {averageRating.toFixed(1)}
            </span>
            <span className="mb-1 text-sm text-[#858680]">/ 5.0</span>
          </div>
          <div className="mt-2">
            <RatingStars rating={Math.round(averageRating)} />
          </div>
        </div>

        <div className="rounded-lg border border-[#e0e0da] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#777973]">Total ratings</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e5f0e8]">
              <MessageSquareText size={18} className="text-[#39724b]" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-[#20221f]">
            {ratingItems.length}
          </p>
          <p className="mt-2 text-xs text-[#858680]">
            Ratings for spaces and equipment
          </p>
        </div>

        <div className="rounded-lg border border-[#e0e0da] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#777973]">5-star ratings</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e5f0e8]">
              <Star size={18} className="fill-[#39724b] text-[#39724b]" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-[#20221f]">
            {fiveStarCount}
          </p>
          <p className="mt-2 text-xs text-[#858680]">
            {ratingItems.length
              ? `${Math.round((fiveStarCount / ratingItems.length) * 100)}% of all ratings`
              : "No ratings yet"}
          </p>
        </div>

        <div className="rounded-lg border border-[#e0e0da] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#777973]">Pending feedback</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f5e4e1]">
              <MessageSquareText size={18} className="text-[#a34d42]" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-[#20221f]">
            {pendingFeedbackCount}
          </p>
          <p className="mt-2 text-xs text-[#858680]">
            Feedback awaiting review
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="overflow-hidden rounded-lg border border-[#e0e0da] bg-white">
        <div className="border-b border-[#eeeeea] px-4 sm:px-6">
          <div
            className="flex gap-6"
            role="tablist"
            aria-label="Rating and feedback sections">
            <button
              id="rating-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === "rating"}
              aria-controls="rating-panel"
              onClick={() => handleTabChange("rating")}
              className={`relative flex items-center gap-2 py-4 text-sm font-semibold transition-colors ${
                activeTab === "rating"
                  ? "text-[#39724b]"
                  : "text-[#777973] hover:text-[#343630]"
              }`}>
              <Star size={16} />
              Rating
              <span
                className={`rounded-md px-1.5 py-0.5 text-xs ${
                  activeTab === "rating"
                    ? "bg-[#e5f0e8] text-[#39724b]"
                    : "bg-[#f0f0ec] text-[#777973]"
                }`}>
                {ratingItems.length}
              </span>
              {activeTab === "rating" && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#39724b]" />
              )}
            </button>

            <button
              id="feedback-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === "feedback"}
              aria-controls="feedback-panel"
              onClick={() => handleTabChange("feedback")}
              className={`relative flex items-center gap-2 py-4 text-sm font-semibold transition-colors ${
                activeTab === "feedback"
                  ? "text-[#39724b]"
                  : "text-[#777973] hover:text-[#343630]"
              }`}>
              <MessageSquareText size={16} />
              Feedback
              <span
                className={`rounded-md px-1.5 py-0.5 text-xs ${
                  activeTab === "feedback"
                    ? "bg-[#e5f0e8] text-[#39724b]"
                    : "bg-[#f0f0ec] text-[#777973]"
                }`}>
                {feedbackItems.length}
              </span>
              {activeTab === "feedback" && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#39724b]" />
              )}
            </button>
          </div>
        </div>

        {/* Rating panel */}
        {activeTab === "rating" && (
          <div id="rating-panel" role="tabpanel" aria-labelledby="rating-tab">
            <div className="flex flex-col gap-4 border-b border-[#eeeeea] px-4 py-5 sm:px-6">
              <div>
                <h2 className="text-base font-semibold text-[#20221f]">
                  Customer ratings
                </h2>
                <p className="mt-1 text-sm text-[#777973]">
                  Reviews for your creative spaces and equipment listings.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_190px_170px]">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858680]"
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search customer or resource..."
                    aria-label="Search ratings"
                    className={`${fieldClassName} pl-9`}
                  />
                </div>

                <div className="relative">
                  <select
                    value={resourceType}
                    onChange={(event) => setResourceType(event.target.value)}
                    aria-label="Filter resource type"
                    className={`${fieldClassName} appearance-none pr-9`}>
                    <option value="all">All resource types</option>
                    <option value="Creative Space">Creative Space</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#858680]"
                  />
                </div>

                <div className="relative">
                  <select
                    value={ratingStatus}
                    onChange={(event) =>
                      setRatingStatus(event.target.value as RatingStatus)
                    }
                    aria-label="Filter by star rating"
                    className={`${fieldClassName} appearance-none pr-9`}>
                    {(
                      [
                        "All ratings",
                        "5 stars",
                        "4 stars",
                        "3 stars",
                        "2 stars",
                        "1 star",
                      ] as RatingStatus[]
                    ).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#858680]"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-200 text-left text-sm">
                <thead className="bg-[#fafaf7] text-xs uppercase tracking-wide text-[#777973]">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Customer</th>
                    <th className="px-6 py-3 font-semibold">Resource</th>
                    <th className="px-6 py-3 font-semibold">Rating</th>
                    <th className="px-6 py-3 font-semibold">Review</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeea]">
                  {filteredRatings.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-[#fafaf7]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e5f0e8] text-sm font-semibold text-[#39724b]">
                            {item.customer
                              .split(" ")
                              .slice(-2)
                              .map((part) => part[0])
                              .join("")}
                          </span>
                          <div>
                            <p className="font-medium text-[#343630]">
                              {item.customer}
                            </p>
                            <p className="mt-0.5 text-xs text-[#858680]">
                              {item.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#e5f0e8]">
                            <ResourceIcon type={item.resourceType} />
                          </span>
                          <div>
                            <p className="font-medium text-[#343630]">
                              {item.resourceName}
                            </p>
                            <p className="mt-0.5 text-xs text-[#858680]">
                              {item.resourceType}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <RatingStars rating={item.rating} />
                      </td>

                      <td className="max-w-sm px-6 py-4">
                        <p className="line-clamp-2 text-sm leading-5 text-[#555750]">
                          {item.comment}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-[#777973]">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {formatDate(item.date)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRatings.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <MessageSquareText
                    size={28}
                    className="mx-auto text-[#b8b9b1]"
                  />
                  <p className="mt-3 text-sm font-medium text-[#343630]">
                    No ratings found
                  </p>
                  <p className="mt-1 text-sm text-[#858680]">
                    Try changing your search or filters.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#eeeeea] px-4 py-3 text-xs text-[#777973] sm:px-6">
              <span>
                Showing {filteredRatings.length} of {ratingItems.length} ratings
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResourceType("all");
                  setRatingStatus("All ratings");
                }}
                className="font-medium text-[#39724b] hover:underline">
                Clear filters
              </button>
            </div>
          </div>
        )}

        {/* Feedback panel */}
        {activeTab === "feedback" && (
          <div
            id="feedback-panel"
            role="tabpanel"
            aria-labelledby="feedback-tab">
            <div className="flex flex-col gap-4 border-b border-[#eeeeea] px-4 py-5 sm:px-6">
              <div>
                <h2 className="text-base font-semibold text-[#20221f]">
                  Booking feedback
                </h2>
                <p className="mt-1 text-sm text-[#777973]">
                  Feedback submitted by customers after their bookings.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_190px_170px]">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858680]"
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search customer, booking..."
                    aria-label="Search feedback"
                    className={`${fieldClassName} pl-9`}
                  />
                </div>

                <div className="relative">
                  <select
                    value={resourceType}
                    onChange={(event) => setResourceType(event.target.value)}
                    aria-label="Filter booking resource type"
                    className={`${fieldClassName} appearance-none pr-9`}>
                    <option value="all">All resource types</option>
                    <option value="Creative Space">Creative Space</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#858680]"
                  />
                </div>

                <div className="relative">
                  <select
                    value={feedbackStatus}
                    onChange={(event) => setFeedbackStatus(event.target.value)}
                    aria-label="Filter feedback status"
                    className={`${fieldClassName} appearance-none pr-9`}>
                    <option value="all">All statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Reviewed">Reviewed</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#858680]"
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#eeeeea]">
              {filteredFeedback.map((item) => (
                <article
                  key={item.id}
                  className="p-4 transition-colors hover:bg-[#fafaf7] sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[#20221f]">
                          {item.bookingId}
                        </span>
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-medium ${
                            item.status === "Reviewed"
                              ? "bg-[#e5f0e8] text-[#39724b]"
                              : "bg-[#faf2df] text-[#946a1e]"
                          }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#777973]">
                        <span className="flex items-center gap-1.5">
                          <UserRound size={14} />
                          {item.customer}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <ResourceIcon type={item.serviceType} />
                          {item.serviceName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {formatDate(item.date)}
                        </span>
                      </div>

                      <div className="mt-3">
                        <RatingStars rating={item.rating} />
                      </div>

                      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#555750]">
                        {item.comment}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setQuery(item.bookingId);
                      }}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-md border border-[#d8d8d1] bg-white px-3 text-sm font-medium text-[#555750] transition-colors hover:border-[#39724b] hover:text-[#39724b]">
                      Find booking
                      <ArrowUpRight size={15} />
                    </button>
                  </div>
                </article>
              ))}

              {filteredFeedback.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <MessageSquareText
                    size={28}
                    className="mx-auto text-[#b8b9b1]"
                  />
                  <p className="mt-3 text-sm font-medium text-[#343630]">
                    No feedback found
                  </p>
                  <p className="mt-1 text-sm text-[#858680]">
                    Try changing your search or filters.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#eeeeea] px-4 py-3 text-xs text-[#777973] sm:px-6">
              <span>
                Showing {filteredFeedback.length} of {feedbackItems.length}{" "}
                feedback entries
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResourceType("all");
                  setFeedbackStatus("all");
                }}
                className="font-medium text-[#39724b] hover:underline">
                Clear filters
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
