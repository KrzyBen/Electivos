import { useEffect, useState } from "react";
import { getActivePeriod } from "@services/periodo.service.js";

export default function useActiveRegistrationPeriod() {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(null);

  const fetchActivePeriod = async () => {
    setLoading(true);

    const { data, status } = await getActivePeriod();

    if (status === 200) {
      setIsActive(true);
      setPeriod(data.data);
    } else {
      setIsActive(false);
      setPeriod(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchActivePeriod();
  }, []);

  return {
    isActive,
    period,
    loading
  };
}
