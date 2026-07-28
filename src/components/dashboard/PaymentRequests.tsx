import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
  fetchIncomingRequests,
  respondToRequest,
} from "../../features/requests/paymentRequestsThunks";
import PaymentRequestsTable from "../tables/PaymentRequestsTable";

import type { RootState, AppDispatch } from "../../app/store";
import type { UserMe } from "../../types";

export default function PaymentRequests({ user }: { user: UserMe }) {
  const dispatch = useDispatch<AppDispatch>();
  const { incoming: requests, loading, error } = useSelector(
    (state: RootState) => state.requests
  );

  useEffect(() => {
    dispatch(fetchIncomingRequests());
  }, [dispatch, user]);

  const handleApprove = (id: string) =>
    dispatch(respondToRequest({ user, requestId: id, accept: true }));

  const handleReject = (id: string) =>
    dispatch(respondToRequest({ user, requestId: id, accept: false }));

  return (
    <PaymentRequestsTable
      requests={requests}
      loading={loading}
      error={error}
      showActions
      variant="incoming"
      onApprove={handleApprove}
      onReject={handleReject}
    />
  );
}
