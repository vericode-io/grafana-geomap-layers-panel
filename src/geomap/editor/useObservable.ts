import { useEffect, useState } from 'react';

import { type Observable } from 'rxjs';

export function useObservable<T>(source: Observable<T>): T | undefined {
  const [value, setValue] = useState<T>();

  useEffect(() => {
    const subscription = source.subscribe(setValue);
    return () => subscription.unsubscribe();
  }, [source]);

  return value;
}
