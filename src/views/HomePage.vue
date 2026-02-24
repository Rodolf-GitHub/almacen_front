<template>
  <section class="space-y-4">
    <header>
      <h1 class="text-2xl font-bold text-[var(--text-100)]">Panel de Almacén</h1>
      <p class="text-sm text-[var(--text-200)]">Resumen rápido de los módulos principales.</p>
    </header>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-lg border border-[var(--bg-300)] bg-white p-4">
        <p class="text-sm text-[var(--text-200)]">Pedidos activos</p>
        <p class="mt-2 text-2xl font-semibold text-[var(--text-100)]">0</p>
      </article>
      <article class="rounded-lg border border-[var(--bg-300)] bg-white p-4">
        <p class="text-sm text-[var(--text-200)]">Productos</p>
        <p class="mt-2 text-2xl font-semibold text-[var(--text-100)]">0</p>
      </article>
      <article class="rounded-lg border border-[var(--bg-300)] bg-white p-4">
        <p class="text-sm text-[var(--text-200)]">Proveedores</p>
        <p class="mt-2 text-2xl font-semibold text-[var(--text-100)]">0</p>
      </article>
      <article class="rounded-lg border border-[var(--bg-300)] bg-white p-4">
        <p class="text-sm text-[var(--text-200)]">Sucursales</p>
        <p class="mt-2 text-2xl font-semibold text-[var(--text-100)]">0</p>
      </article>
    </div>
  </section>
</template>

<style scoped></style>
