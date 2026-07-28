import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import { fetchSentRequests } from "../../features/requests/paymentRequestsThunks";
import PaymentRequestsTable from "../tables/PaymentRequestsTable";

import type { RootState, AppDispatch } from "../../app/store";
import type { UserMe } from "../../types";

export default function SentPaymentRequests({ user }: { user: UserMe }) {
  const dispatch = useDispatch<AppDispatch>();
  const { sent: requests, loading, error } = useSelector(
    (state: RootState) => state.requests
  );

  useEffect(() => {
    dispatch(fetchSentRequests());
  }, [dispatch, user]);

  return (
    <PaymentRequestsTable
      requests={requests}
      loading={loading}
      error={error}
      variant="sent"
    />
  );
}
