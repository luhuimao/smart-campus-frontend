import { useQuery } from "@tanstack/react-query";

interface FormPermissions {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
}

const DEFAULT_PERMS: FormPermissions = {
  canCreate: false,
  canUpdate: false,
  canDelete: false,
  canExport: false,
};

export function useFormPermissions(entryId: string | undefined) {
  const { data, isPending } = useQuery<FormPermissions>({
    queryKey: ["form-permissions", entryId],
    queryFn: async () => {
      if (!entryId) return DEFAULT_PERMS;
      const res = await fetch(`/api/user/form-permissions?entryId=${encodeURIComponent(entryId)}`);
      if (!res.ok) return DEFAULT_PERMS;
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!entryId,
  });

  return data ?? DEFAULT_PERMS;
}

export { DEFAULT_PERMS };
