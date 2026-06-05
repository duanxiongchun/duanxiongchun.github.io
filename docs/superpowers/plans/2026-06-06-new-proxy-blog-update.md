# New Proxy Blog Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the high-performance gateway blog post to align with the latest fully user-space, multiqueue, smoltcp architecture of `new_proxy`.

**Architecture:** Modify the HTML blog post file in-place. Replace descriptions of kernel L3 WireGuard and iptables/TPROXY with userspace WireGuard (boringtun) and userspace L4 TCP offload (smoltcp). Update the buffer pool code block to show the new RAII object pool implementation.

**Tech Stack:** HTML, Vanilla CSS, JavaScript, Python (for validation)

---

### Task 1: Create Validation Script

**Files:**
- Create: `scratch/validate_blog.py`

- [ ] **Step 1: Write the validation script**
  Create a script that parses `blog/network/new_proxy_architecture.html` and checks that obsolete architectural descriptions (like "TPROXY", "内核态的三层") are removed/updated, and new key terms ("smoltcp", "boringtun", "Multiqueue", "Run-to-Completion") are present.

  ```python
  # File: scratch/validate_blog.py
  import os
  import sys
  from html.parser import HTMLParser

  class SimpleHTMLParser(HTMLParser):
      def handle_error(self, message):
          print(f"HTML Parse Error: {message}")
          sys.exit(1)

  def validate():
      path = "blog/network/new_proxy_architecture.html"
      if not os.path.exists(path):
          print(f"Error: {path} not found")
          sys.exit(1)
      
      with open(path, "r", encoding="utf-8") as f:
          content = f.read()

      # Parse HTML to check for syntax validity
      parser = SimpleHTMLParser()
      try:
          parser.feed(content)
      except Exception as e:
          print(f"HTML Parse Error: {e}")
          sys.exit(1)

      # Check for old terms (must be removed/realigned)
      # Note: We keep "TPROXYPort 是旧 TPROXY 路径遗留配置" but check if the main architecture text still relies on TPROXY.
      # So we check if the word "TPROXY 捕获" or "被 TPROXY" is present.
      if "被 TPROXY 捕获" in content or "内核态的三层" in content:
          print("Fail: Obsolete terms/concepts still exist in the blog post!")
          sys.exit(1)

      # Check for new concepts
      required_terms = ["boringtun", "smoltcp", "Run-to-Completion", "Multiqueue", "Deref", "OnceLock"]
      for term in required_terms:
          if term not in content:
              print(f"Fail: Missing required new concept '{term}' in the blog post!")
              sys.exit(1)

      print("Pass: HTML validation checks completed successfully.")

  if __name__ == "__main__":
      validate()
  ```

- [ ] **Step 2: Run validation script to verify it fails**
  Run the validation script to ensure it fails on the current unedited HTML file.
  
  Run: `python3 scratch/validate_blog.py`
  Expected Output: Fail: Obsolete terms/concepts still exist in the blog post! (or similar exit code/error message)

- [ ] **Step 3: Commit the validation script**
  
  ```bash
  git add scratch/validate_blog.py
  git commit -m "test: add validation script for new_proxy blog post"
  ```

---

### Task 2: Update Page Metadata & Introduction

**Files:**
- Modify: `blog/network/new_proxy_architecture.html`

- [ ] **Step 1: Edit Page Title and Introduction**
  Update the SEO description and intro paragraphs to introduce the fully user-space, firewall-free architecture.
  
  Replace lines 10-10:
  ```html
    <meta name="description" content="深入探索基于 QUIC 和 Rust 的高性能安全网关的设计与核心原理，包含多流隔离可靠传输与广域网段性能优化，内置交互式网络动画演示。">
  ```
  with:
  ```html
    <meta name="description" content="深入探索基于 Rust、boringtun 和 smoltcp 的高性能全用户态安全代理网关的设计与核心原理，包含多流隔离可靠传输与多队列 Run-to-Completion 性能优化，内置交互式网络动画演示。">
  ```

  Replace lines 905-910:
  ```html
        <p>在现代安全网络隧道与 VPN 技术中，<strong>内核态的三层（L3）VPN（如 WireGuard）</strong>以其极简的设计、极低的延迟和极佳的吞吐量成为了业界新宠。然而，在跨地域、跨运营商的真实广域网（WAN）传输中，传统的 L3 VPN 在面对丢包抖动和大规模并发流量时，仍然容易遭遇明显的性能瓶颈。其根本症结在于：传统三层 VPN 隧道<strong>“只透传不优化”</strong>，且整条隧道被限制 in 单管单通道的设计内，缺乏对长距离网络时延（RTT）及随机丢包的主动优化手段。</p>
  
        <p>为了彻底打破这一吞吐瓶颈，我设计并实现了我的第一个高性能网关项目：<code>new_proxy</code>。这是一个<strong>基于 Rust 编写的混合 L3/L4 高性能安全代理网关</strong>。它巧妙地将内核态的极速三层封装与用户态的 QUIC 协议融为一体。它不仅通过“代理中继”打断了传统的 TCP “长细管道”限制，更充分利用了 QUIC 在用户态实现的<strong>快速可靠传输</strong>与<strong>独立多流拥塞控制</strong>能力，从而在恶劣物理链路上释放出令人惊叹的带宽效率。</p>
  ```
  with:
  ```html
        <p>在现代安全网络隧道与 VPN 技术中，三层（L3）VPN（如 WireGuard）以其极简的设计、极低的延迟和极佳的吞吐量成为了安全互联的首选。然而，在跨地域、跨运营商的真实广域网（WAN）传输中，传统的 L3 VPN 在面对丢包抖动和大规模并发流量时，仍然容易遭遇明显的性能瓶颈。其根本症结在于：传统三层 VPN 隧道<strong>“只透传不优化”</strong>，且整条隧道被限制在单管单通道的设计内，缺乏对长距离网络时延（RTT）及随机丢包的主动优化手段。</p>
  
        <p>为了彻底打破这一吞吐瓶颈，我设计并实现了我的第一个高性能网关项目：<code>new_proxy</code>。这是一个<strong>基于 Rust 编写的完全运行在用户态的混合 L3/L4 高性能安全代理网关</strong>。它免除了内核态 WireGuard 模块以及复杂的 `iptables`/`TPROXY` 规则注入，巧妙地将基于 <code>boringtun</code> 的用户态三层隧道与基于 QUIC（<code>quinn</code>）及 <code>smoltcp</code> 用户态协议栈的四层多路复用网关融为一体。它不仅通过“代理中继”打断了传统的 TCP “长细管道”限制，更充分利用了 QUIC 在用户态实现的<strong>快速可靠传输</strong>与<strong>独立多流拥塞控制</strong>能力，在恶劣物理链路上释放出令人惊叹的带宽效率。</p>
  ```

- [ ] **Step 2: Commit intermediate changes**
  
  ```bash
  git add blog/network/new_proxy_architecture.html
  git commit -m "docs: update metadata and intro in new_proxy blog"
  ```

---

### Task 3: Update Section 2 (Core Architecture & Userspace Redirection)

**Files:**
- Modify: `blog/network/new_proxy_architecture.html`

- [ ] **Step 1: Rewrite Section 2 Core Architecture Description**
  Replace kernel L3/TPROXY description with fully user-space L3 boringtun and L4 smoltcp offloading.
  
  Replace lines 925-953:
  ```html
        <h2 id="section-2">2. new_proxy 的解法：基于 QUIC 的可靠传输与多流并发</h2>
        <p>为了攻克传统 VPN 的广域网瓶颈，<code>new_proxy</code> 引入了<strong>三层/四层混合分流与用户态 L4 拦截</strong>机制：将无状态、轻量级的 UDP/ICMP 流量留在内核态 L3 通道中，而将重状态、占大头的 TCP 业务流量剥离出来，透明拦至用户态，并通过以下三大技术支柱实现吞吐量的极限释放：</p>
  
        <h3>2.1 三大核心技术支柱</h3>
        
        <p><strong>第一柱：QUIC 在用户态实现的极速可靠传输</strong><br>
        QUIC 虽然同样运行于 UDP 之上，但它在用户态实现了一套高度优化的<strong>可靠传输与丢包恢复机制</strong>。当物理网络发生随机丢包时：<br>
        • <strong>快速丢包检测</strong>：QUIC 彻底抛弃了 TCP 的字节流序列号，改用单调递增的 Packet Number，这消除了重传歧义。结合精密的丢包检测算法，QUIC 能够在毫秒级感知到数据丢失。<br>
        • <strong>极速重传恢复</strong>：由于协议运行在用户态，<code>new_proxy</code> 无需依赖操作系统内核缓慢的重传定时器，而是在用户态以极高的敏捷度直接对丢失的数据包发起主动重传，极大地降低了物理丢包对上层业务流带来的卡顿感。</p>
  ```
  with:
  ```html
        <h2 id="section-2">2. new_proxy 的解法：完全用户态的双轨架构与多流并发</h2>
        <p>为了攻克传统 VPN 的广域网瓶颈，同时避免对操作系统底层模块（如 WireGuard 内核模块）和敏感防火墙规则（如 <code>iptables</code> / <code>TPROXY</code>）的依赖，<code>new_proxy</code> 引入了<strong>完全运行在用户态的混合 L3/L4 代理分流</strong>机制。它摒弃了透明代理拦截的传统做法，改为基于虚拟多队列 TUN 读写，在进程内构建了一套“双轨”数据面：</p>
  
        <h3>2.1 四大核心技术支柱</h3>
        
        <p><strong>第一柱：纯用户态的双轨分流面 (Zero-Firewall Dependency)</strong><br>
        整个网关的数据拦截和分发完全在用户态中处理，彻底消除了对系统内核防火墙的依赖：<br>
        • <strong>用户态三层 (L3) 轨道</strong>：UDP 和 ICMP 报文命中路由后，直接由客户端进程内嵌入的 <code>boringtun</code> 库进行 WireGuard 格式的噪声加密与安全封装，生成外层 UDP 包直接发出。<br>
        • <strong>用户态四层 (L4) 拦截与卸载</strong>：TCP 报文到达 TUN 设备后，不再经过系统内核协议栈，而是由各工作线程绑定的 <code>smoltcp</code>（Rust 编写的独立用户态网络协议栈）接管，进行本地 NAT 改写，直接将其桥接到 QUIC 池的数据流中。这使得网关无需注入任何 <code>iptables</code> 或 <code>TPROXY</code> 规则即可实现透明流接管，非常有利于无特权容器环境部署。</p>
  
        <p><strong>第二柱：QUIC 在用户态实现的极速可靠传输</strong><br>
        QUIC 虽然同样运行于 UDP 之上，但它在用户态实现了一套高度优化的<strong>可靠传输与丢包恢复机制</strong>。当物理网络发生随机丢包时：<br>
        • <strong>快速丢包检测</strong>：QUIC 彻底抛弃了 TCP 的字节流序列号，改用单调递增的 Packet Number，这消除了重传歧义。结合精密的丢包检测算法，QUIC 能够在毫秒级感知到数据丢失。<br>
        • <strong>极速重传恢复</strong>：由于协议运行在用户态，<code>new_proxy</code> 无需依赖操作系统内核缓慢的重传定时器，而是在用户态以极高的敏捷度直接对丢失的数据包发起主动重传，极大地降低了物理丢包对上层业务流带来的卡顿感。</p>
  ```

- [ ] **Step 2: Commit intermediate changes**
  
  ```bash
  git add blog/network/new_proxy_architecture.html
  git commit -m "docs: update core architecture description in blog"
  ```

---

### Task 4: Update Section 3 (Optimizations, Multiqueue TUN, RTC, and Code Snippet)

**Files:**
- Modify: `blog/network/new_proxy_architecture.html`

- [ ] **Step 1: Rewrite Section 3.1 & 3.2**
  Introduce Multiqueue TUN and Run-to-Completion details in Section 3.1. Replace the buffer pool code block with the latest RAII implementation in Section 3.2. Update control plane details.
  
  Replace lines 993-1088:
  ```html
        <h2 id="section-3">3. 为了追求高性能，new_proxy 做了哪些事情？</h2>
        <p>作为高性能混合网关，<code>new_proxy</code> 在系统级并发、内存管理 and 握手损耗上进行了大量深度打磨，主要包含以下三大核心性能支柱：</p>
  
        <h3>3.1 突破内核单套接字瓶颈：多物理连接端口池</h3>
        <p>在 Linux 内核的网络栈中，单 UDP 套接字（Socket）在大并发高吞吐场景下，由于锁竞争和单核处理队列的限制，往往会成为整机吞吐量的“阿喀琉斯之踵”。</p>
        <p><code>new_proxy</code> 独创了<strong>多物理连接端口池（Multi-Port Physical Connection Pool）</strong>的设计：</p>
        <ul>
          <li><strong>服务端</strong>：可配置一组 UDP 端口范围（如 40001 至 40004），同时启动多个独立的并发 QUIC 监听器。</li>
          <li><strong>客户端</strong>：自动识别端口池，并分别与服务端的这组端口建立<strong>多条独立的物理 QUIC 连接</strong>。</li>
          <li><strong>分流与负载均衡</strong>：当新的 TCP 业务流被 TPROXY 捕获时，客户端分流器采用 <strong>Round-Robin (轮询) 算法</strong>将其负载均衡地调度到不同的物理 QUIC 连接中。</li>
        </ul>
  
        <p>以下是多端口轮询分流的动态演示。它模拟了局域网源源不断进来的 TCP 连接是如何被轮询分配到物理端口，并在遭遇某一端口受干扰损坏时进行高可用容灾的：</p>
        ...
        <p>通过多端口池设计，<code>new_proxy</code> 带来了以下两个显著的性能增益：</p>
        <p>1. <strong>多核并行化</strong>：让 Linux 内核将不同的 UDP 端口中断分配给不同的 CPU 核心，极大地提升了系统网卡队列的处理吞吐量。</p>
        <p>2. <strong>抗 QOS 限速与干扰</strong>：国内部分 ISP 运营商会对单连接单端口的 UDP 流量进行严重的 QOS 限速或干扰。多物理连接池能够有效分散特征，并实现多路径的带宽叠加。</p>
  
        <h3>3.2 零拷贝与内存优化：全局 Buffer 内存池</h3>
        <p>在高并发网络网关中，频繁分配和销毁 16KB 等规格的网络读写缓冲区（Buffer），会导致严重的堆内存碎片以及频繁的垃圾回收延迟（Malloc/Free Overhead）。</p>
        <p><code>new_proxy</code> 采用了高性能的<strong>全局线程安全对象池（Buffer Pool）</strong>来接管内存管理。以下是其核心实现的缩影：</p>
  
  <pre><code class="language-rust">// 摘自 src/relay.rs：全局 Buffer 缓冲池设计
  static BUFFER_POOL: OnceLock&lt;BufferPool&gt; = OnceLock::new();
  
  struct BufferPool {
      pool: Mutex&lt;Vec&lt;Box&lt;[u8; 16 * 1024]&gt;&gt;&gt;, // 缓存 16KB 大小的内存块
  }
  
  impl BufferPool {
      fn get() -> Box&lt;[u8; 16 * 1024]&gt; {
          if let Some(buf) = Self::global().pool.lock().pop() {
              buf
          } else {
              Box::new([0u8; 16 * 1024]) // 高并发时按需创建
          }
      }
  
      fn put(buf: Box&lt;[u8; 16 * 1024]&gt;) {
          let mut p = Self::global().pool.lock();
          if p.len() < 128 {
              p.push(buf); // 回收内存块
          }
      }
  }
  </code></pre>
  
        <p>* <strong>RAII 自动回收</strong>：通过自定义的智能指针 <code>PooledBuffer</code> 实现了 <code>Deref/DerefMut</code> 以及 <code>Drop</code> 特征。当网络流生命周期结束时，系统会自动回收内存，极大地锁死了堆内存的抖动。</p>
  
        <h3>3.3 极速安全握手：自签证书指纹绑定</h3>
        <p>传统的 SSL/TLS 握手需要经历昂贵且复杂的证书链解析与 CA 校验，增加了首包延迟（TTFB）。</p>
        <p><code>new_proxy</code> 在安全性与速度之间找到了完美的平衡：通过双向非对称轻量级控制面，在握手阶段计算 <b>X25519 共享密钥</b>。服务端启动时动态生成自签名证书，并将 <strong>SHA-256 证书指纹</strong>通过认证过的加密控制通道安全下发至客户端。客户端在 QUIC TLS 握手时通过自定义的 <code>PinnedCertVerifier</code> 直接对指纹进行硬编码验证，从而<strong>完全绕过繁重的 CA 验证步骤，使首包握手降低到了惊人的 1 个 RTT</strong>。</p>
  
        <h2 id="section-4">4. 总结</h2>
        <p>作为我的第一个高性能网关项目，<code>new_proxy</code> 的精髓在于<strong>对合适的数据采用最合适的协议与路径</strong>。它成功将内核的高性能与用户态的抗丢包多路复用进行了互补融合，完美解决了传统的网络痛点。这也是一次将前沿理论与工程实践深度结合的高性能网络探索之旅！</p>
  ```
  with:
  ```html
        <h2 id="section-3">3. 为了追求极致性能，new_proxy 做了哪些系统优化？</h2>
        <p>作为一个完全运行在用户态的混合网关，<code>new_proxy</code> 在系统级并发、线程调度、内存管理以及控制面握手开销上进行了高难度的深度打磨，主要实现了以下四大核心高性能与高可用设计：</p>
  
        <h3>3.1 多线程高扩展：Multiqueue TUN 与 Run-to-Completion (RTC) 事件循环</h3>
        <p>为了在现代多核服务器上释放最大的吞吐潜力，<code>new_proxy</code> 客户端没有采用单线程轮询或简单的多线程加锁共享状态模型，而是基于 Linux <strong>多队列 TUN 设备（`IFF_MULTI_QUEUE`）</strong> 构建了无锁的 CPU 并行计算模型：</p>
        <ul>
          <li><strong>Flow Queue Affinity (流队列亲和)</strong>：客户端根据配置的并发工作线程数创建对应数量的独立 <code>RtcWorker</code> 线程，每个 worker 分别绑定并持有一个 TUN 设备的专属队列文件描述符。Linux 内核网络栈会根据 TCP 流哈希自动保证同一个 TCP 连接（Flow）的所有数据包都被分流并维持在同一个 TUN 队列上。</li>
          <li><strong>Run-to-Completion (RTC) 无锁事件循环</strong>：每个 <code>RtcWorker</code> 的事件循环是一个封闭的、高度专注的 RTC 环路。在一个迭代周期内，它从绑定的 TUN 队列读取原始 IP 报文，直接在当前线程内完成 TCP 解析、本地用户态 NAT 映射表查找和改写，然后递送给专属的 <code>smoltcp</code> 实例，或者交给 userspace WireGuard 进行 L3 加密，最后直接输出。</li>
          <li><strong>无跨线程开销</strong>：整个生命周期（从包接收、NAT、协议栈处理到物理 QUIC 流数据通道转发）都在同一个 CPU 核心线程内完成，消除了昂贵的线程上下文切换和跨核锁竞争，实现了极高的多核线性可扩展性。</li>
          <li><strong>故障安全降级 (WireGuard Fallback)</strong>：当检测到目标 peer 的 QUIC 连接池由于物理链路中断而变为不可用状态时，RtcWorker 会自动退化该 TCP 连接的数据路径，将其作为普通的 L3 报文直接灌入用户态 <code>boringtun</code> 进行 WireGuard 加密封装发出，确保高可用连接不中断。</li>
        </ul>
  
        <h3>3.2 突破内核单套接字瓶颈：多物理连接端口池</h3>
        <p>在 Linux 内核的网络栈中，单 UDP 套接字（Socket）在大并发高吞吐场景下，由于锁竞争和单核处理队列的限制，往往会成为整机吞吐量的“阿喀琉斯之踵”。</p>
        <p><code>new_proxy</code> 独创了<strong>多物理连接端口池（Multi-Port Physical Connection Pool）</strong>的设计：</p>
        <ul>
          <li><strong>服务端</strong>：可配置一组 UDP 端口范围（如 40001 至 40004），同时启动多个独立的并发 QUIC 监听器。</li>
          <li><strong>客户端</strong>：自动识别端口池，并分别与服务端的这组端口建立<strong>多条独立的物理 QUIC 连接</strong>。</li>
          <li><strong>分流与负载均衡</strong>：当新的 TCP 业务流在 TUN 中被捕获时，对应的 <code>RtcWorker</code> 采用 <strong>Round-Robin (轮询) 算法</strong>将其负载均衡地调度到不同的物理 QUIC 连接中。</li>
        </ul>
  
        <p>以下是多端口轮询分流的动态演示。它模拟了局域网源源不断进来的 TCP 连接是如何被轮询分配到物理端口，并在遭遇某一端口受干扰损坏时进行高可用容灾的：</p>
        ...
        <p>通过多端口池设计，<code>new_proxy</code> 带来了以下两个显著的性能增益：</p>
        <p>1. <strong>多核并行化</strong>：让 Linux 内核将不同的 UDP 端口中断分配给不同的 CPU 核心，极大地提升了系统网卡队列的处理吞吐量。</p>
        <p>2. <strong>抗 QOS 限速与干扰</strong>：国内部分 ISP 运营商会对单连接单端口的 UDP 流量进行严重的 QOS 限速或干扰。多物理连接池能够有效分散特征，并实现多路径的带宽叠加。</p>
  
        <h3>3.3 零拷贝与内存优化：全局 Buffer 内存池</h3>
        <p>在高并发网络网关中，频繁分配和销毁 16KB 等规格的网络读写缓冲区（Buffer），会导致严重的堆内存碎片以及频繁的垃圾回收延迟（Malloc/Free Overhead）。</p>
        <p><code>new_proxy</code> 采用了高性能的<strong>全局线程安全对象池（Buffer Pool）</strong>来接管内存管理。以下是其核心实现的缩影：</p>
  
  <pre><code class="language-rust">// 摘自 src/relay.rs：全局 Buffer 缓冲池设计
  static BUFFER_POOL: OnceLock&lt;BufferPool&gt; = OnceLock::new();
  
  struct BufferPool {
      pool: Mutex&lt;Vec&lt;Box&lt;[u8; 16 * 1024]&gt;&gt;&gt;,
  }
  
  impl BufferPool {
      fn global() -> &apos;static BufferPool {
          BUFFER_POOL.get_or_init(|| BufferPool {
              pool: Mutex::new(Vec::with_capacity(64)),
          })
      }
  
      fn get() -> Box&lt;[u8; 16 * 1024]&gt; {
          if let Some(buf) = Self::global().pool.lock().pop() {
              buf
          } else {
              Box::new([0u8; 16 * 1024])
          }
      }
  
      fn put(buf: Box&lt;[u8; 16 * 1024]&gt;) {
          let mut p = Self::global().pool.lock();
          if p.len() < 128 {
              p.push(buf);
          }
      }
  }
  
  struct PooledBuffer(Option&lt;Box&lt;[u8; 16 * 1024]&gt;&gt;);
  
  impl PooledBuffer {
      fn new() -> Self {
          Self(Some(BufferPool::get()))
      }
  }
  
  impl std::ops::Deref for PooledBuffer {
      type Target = [u8; 16 * 1024];
      fn deref(&amp;self) -> &amp;Self::Target {
          self.0.as_ref().unwrap()
      }
  }
  
  impl std::ops::DerefMut for PooledBuffer {
      fn deref_mut(&amp;mut self) -> &amp;mut Self::Target {
          self.0.as_mut().unwrap()
      }
  }
  
  impl Drop for PooledBuffer {
      fn drop(&amp;mut self) {
          if let Some(buf) = self.0.take() {
              BufferPool::put(buf);
          }
      }
  }
  </code></pre>
  
        <p>• <strong>RAII 自动回收机制</strong>：通过自定义的智能包装结构 <code>PooledBuffer</code> 实现了 Rust 的 <code>Deref</code>、<code>DerefMut</code> 和 <code>Drop</code> 特征。当网络转发流的生命周期结束、智能指针生命周期终结时，底层的 16KB 缓存块会被安全地重置并送回缓冲池中，杜绝了频繁申请堆内存造成的系统抖动。</p>
  
        <h3>3.4 控制面加固与指纹绑定：极速 1-RTT 安全建连</h3>
        <p>为了保障握手速度与极佳的前向安全性，<code>new_proxy</code> 废弃了传统的 CA 证书链校验：</p>
        <ul>
          <li><strong>对等协商</strong>：控制面基于对等密钥体系，复用 WireGuard 预置的 X25519 密钥材料通过 Diffie-Hellman 计算共享密钥，并使用 HMAC-SHA256 签名控制帧，抵御重放与中间人劫持。</li>
          <li><strong>证书指纹下发与 Pinning</strong>：服务端启动时动态生成自签名证书，在经过认证的控制面通道将证书的 SHA-256 摘要安全派发至客户端。客户端通过定制的 <code>PinnedCertVerifier</code> 对该指纹进行绑定校验。在 QUIC 握手阶段绕过了昂贵缓慢的证书链层级验证，在安全的前提下，使首包连接降低到了惊人的 1-RTT。</li>
          <li><strong>DDoS 防护限速</strong>：针对多 Peer 部署场景，当收到来自未知 Peer 触发的 WireGuard 握手包或控制类请求时，会经过每 IP 的 Token Bucket 轻量令牌桶限速，避免系统在受到外界非法扫描攻击时，由于逐个尝试解密导致 CPU 耗尽。</li>
        </ul>
  
        <h2 id="section-4">4. 总结</h2>
        <p>作为高性能安全网络探索的实践结晶，<code>new_proxy</code> 的精髓在于<strong>利用内核多队列优势，把复杂协议卸载到无锁用户态</strong>。它融合了 <code>boringtun</code> (L3 Userspace) 和 <code>smoltcp</code> + QUIC (L4 Userspace) 的双轨特长，兼顾高可用与极佳的 WAN 吞吐效率。这也是一次将操作系统底层的事件循环并行开发与网络协议工程实践深度融合的旅程！</p>
  ```

- [ ] **Step 2: Commit intermediate changes**
  
  ```bash
  git add blog/network/new_proxy_architecture.html
  git commit -m "docs: update sections 3 and 4 in blog post"
  ```

---

### Task 5: Verify Blog Integration and Cleanup

**Files:**
- Modify: `blog/network/new_proxy_architecture.html`
- Delete: `scratch/validate_blog.py`

- [ ] **Step 1: Update Table of Contents (TOC) Labels**
  Make sure the TOC matches the new naming structure.
  
  Replace lines 1113-1117:
  ```html
            <li class="toc-item active" id="toc-sec1"><a href="#section-1">1. 传统 VPN 痛点与 BDP 瓶颈</a></li>
            <li class="toc-item" id="toc-sec2"><a href="#section-2">2. new_proxy 核心技术支柱</a></li>
            <li class="toc-item" id="toc-sec3"><a href="#section-3">3. 追求极限的高性能优化</a></li>
            <li class="toc-item" id="toc-sec4"><a href="#section-4">4. 网关架构总结</a></li>
  ```
  with:
  ```html
            <li class="toc-item active" id="toc-sec1"><a href="#section-1">1. 传统 VPN 痛点与 BDP 瓶颈</a></li>
            <li class="toc-item" id="toc-sec2"><a href="#section-2">2. 完全用户态解法与多流并发</a></li>
            <li class="toc-item" id="toc-sec3"><a href="#section-3">3. 追求极致性能的系统优化</a></li>
            <li class="toc-item" id="toc-sec4"><a href="#section-4">4. 网关架构总结</a></li>
  ```

- [ ] **Step 2: Run validation script**
  Run the validation script to verify that the HTML parses correctly and all obsolete/new terms check out.
  
  Run: `python3 scratch/validate_blog.py`
  Expected Output: Pass: HTML validation checks completed successfully.

- [ ] **Step 3: Remove the validation script**
  Delete the temporary python script.
  
  Run: `rm scratch/validate_blog.py`
  Expected: Script deleted.

- [ ] **Step 4: Final commit**
  
  ```bash
  git add blog/network/new_proxy_architecture.html
  git commit -m "docs: update TOC labels and verify blog post integrity"
  ```

---
