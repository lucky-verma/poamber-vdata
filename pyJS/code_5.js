// Code from CSV row
private Collection getPcClassLoaders() {
       if (_pcClassLoaders == null)
         _pcClassLoaders = new ConcurrentReferenceHashSet(
             ConcurrentReferenceHashSet.WEAK);
          
       return _pcClassLoaders;
    }
