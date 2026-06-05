# 2026-06-06 New Proxy Blog Update Design

## 1. Background & Goals
The high-performance gateway (`new_proxy`) has been completely refactored. The architecture transitioned from a hybrid kernel L3 (WireGuard) / user L4 (TPROXY) design to a **fully user-space dual-track architecture** utilizing:
- Userspace L3 WireGuard via `boringtun`.
- Userspace L4 TCP offloading via `smoltcp` bound to a multiqueue TUN device.
- Elimination of all firewall dependencies (no `iptables`, `nftables`, or `TPROXY` redirection).
- Multi-threaded `RtcWorker` threads operating on a **Run-to-Completion (RTC)** loop with **Flow Queue Affinity**.
- Upgraded control plane security (X25519, HMAC-SHA256, nonces) and pinned certificate fingerprint validation.

The goal is to update the blog post located at `blog/network/new_proxy_architecture.html` to accurately reflect these technical advancements and update the associated Rust code snippet.

## 2. Proposed Changes

### 2.1 Abstract and Meta Description Update
- Update page meta description and abstract to emphasize the fully user-space, firewall-free architecture.
- Adjust estimated word counts if significantly changed.

### 2.2 Section 2: Architecture & L3/L4 Dual-Track (Full User-space)
- **Concept Rewrite**: Correct the description stating UDP/ICMP is processed in kernel-space. Replace with the details of **userspace L3 WireGuard** using `boringtun::noise::Tunn` in-process.
- **L4 TUN Takeover**: Clarify that TCP traffic targeting the proxy peer is captured at the virtual TUN level and fed to `smoltcp` user-space TCP stack directly, instead of using TPROXY listeners.
- **Firewall Independence**: Highlight that this design requires **no iptables, nftables, or TPROXY rules**, making deployment in restricted/containerized environments seamless.

### 2.3 Section 3.1: Concurrency, Multiqueue TUN, and Run-to-Completion Loop
- Rename the section from `突破内核单套接字瓶颈：多物理连接端口池` to include `IFF_MULTI_QUEUE` and Run-to-Completion logic.
- Add explanation of:
  - **Multiqueue TUN**: Binding different queues of a single TUN device to separate worker threads (`RtcWorker`).
  - **Flow Queue Affinity**: How Linux hashes TCP flows to specific queues, guaranteeing that a connection always hits the same worker. This avoids multi-threaded locks for `smoltcp` sockets and NAT maps.
  - **Run-to-Completion (RTC)**: Processing packets (read, NAT rewrite, protocol stack processing, bridge stream transmission) from start to finish on a single thread to eliminate context switching and lock contention.
  - **DDoS/Scan Rate Limiting**: Introduce the token-bucket rate limiter implemented for unknown-source handshake packets.

### 2.4 Section 3.2: Buffer Pool Code Snippet
- Replace the simplified code snippet with the exact, production-ready `BUFFER_POOL` and `PooledBuffer` implementation from `src/relay.rs` featuring `OnceLock`, static `BufferPool` with a mutex-protected vector pool, and custom RAII dereference and drop mechanics.

### 2.5 Sidebar & Navigation Alignment
- Update the Table of Contents (TOC) links and IDs to match the revised sections.

## 3. Verification Plan
- **Syntax check**: Verify the HTML file is well-formed.
- **TOC & Script execution**: Confirm the progressive scroll highlighting and interactive canvas animations function correctly without console errors.
