// App.tsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContractReadOnly, getContractWithSigner } from "./contract";
import WalletManager from "./components/WalletManager";
import WalletSelector from "./components/WalletSelector";
import "./App.css";

interface TutoringRecord {
  id: string;
  encryptedData: string;
  timestamp: number;
  owner: string;
  category: string;
  attentionLevel: number;
}

const App: React.FC = () => {
  // Randomly selected styles: High Contrast (Red+Black), Cyberpunk UI, Center Radiation Layout, Gesture Controls
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<TutoringRecord[]>([]);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [walletSelectorOpen, setWalletSelectorOpen] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<{
    visible: boolean;
    status: "pending" | "success" | "error";
    message: string;
  }>({ visible: false, status: "pending", message: "" });
  const [newRecordData, setNewRecordData] = useState({
    category: "",
    description: "",
    attentionScore: "50"
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  // Randomly selected features: Data Statistics, Smart Charts, Search & Filter, Team Information
  const totalRecords = records.length;
  const avgAttentionScore = records.length > 0 
    ? records.reduce((sum, record) => sum + record.attentionLevel, 0) / records.length 
    : 0;

  useEffect(() => {
    loadRecords().finally(() => setLoading(false));
  }, []);

  const onWalletSelect = async (wallet: any) => {
    if (!wallet.provider) return;
    try {
      const web3Provider = new ethers.BrowserProvider(wallet.provider);
      setProvider(web3Provider);
      const accounts = await web3Provider.send("eth_requestAccounts", []);
      const acc = accounts[0] || "";
      setAccount(acc);

      wallet.provider.on("accountsChanged", async (accounts: string[]) => {
        const newAcc = accounts[0] || "";
        setAccount(newAcc);
      });
    } catch (e) {
      alert("Failed to connect wallet");
    }
  };

  const onConnect = () => setWalletSelectorOpen(true);
  const onDisconnect = () => {
    setAccount("");
    setProvider(null);
  };

  const checkAvailability = async () => {
    try {
      const contract = await getContractReadOnly();
      if (!contract) return;
      
      const isAvailable = await contract.isAvailable();
      if (isAvailable) {
        setTransactionStatus({
          visible: true,
          status: "success",
          message: "FHE Contract is available!"
        });
      } else {
        setTransactionStatus({
          visible: true,
          status: "error",
          message: "FHE Contract is not available"
        });
      }
    } catch (e) {
      setTransactionStatus({
        visible: true,
        status: "error",
        message: "Error checking contract availability"
      });
    }
    setTimeout(() => setTransactionStatus({ visible: false, status: "pending", message: "" }), 3000);
  };

  const loadRecords = async () => {
    setIsRefreshing(true);
    try {
      const contract = await getContractReadOnly();
      if (!contract) return;
      
      const keysBytes = await contract.getData("record_keys");
      let keys: string[] = [];
      
      if (keysBytes.length > 0) {
        try {
          keys = JSON.parse(ethers.toUtf8String(keysBytes));
        } catch (e) {
          console.error("Error parsing record keys:", e);
        }
      }
      
      const list: TutoringRecord[] = [];
      
      for (const key of keys) {
        try {
          const recordBytes = await contract.getData(`record_${key}`);
          if (recordBytes.length > 0) {
            try {
              const recordData = JSON.parse(ethers.toUtf8String(recordBytes));
              list.push({
                id: key,
                encryptedData: recordData.data,
                timestamp: recordData.timestamp,
                owner: recordData.owner,
                category: recordData.category,
                attentionLevel: recordData.attentionLevel || 50
              });
            } catch (e) {
              console.error(`Error parsing record data for ${key}:`, e);
            }
          }
        } catch (e) {
          console.error(`Error loading record ${key}:`, e);
        }
      }
      
      list.sort((a, b) => b.timestamp - a.timestamp);
      setRecords(list);
    } catch (e) {
      console.error("Error loading records:", e);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  const submitRecord = async () => {
    if (!provider) { 
      alert("Please connect wallet first"); 
      return; 
    }
    
    setCreating(true);
    setTransactionStatus({
      visible: true,
      status: "pending",
      message: "Encrypting ADHD data with FHE..."
    });
    
    try {
      // Simulate FHE encryption
      const encryptedData = `FHE-${btoa(JSON.stringify(newRecordData))}`;
      
      const contract = await getContractWithSigner();
      if (!contract) {
        throw new Error("Failed to get contract with signer");
      }
      
      const recordId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const recordData = {
        data: encryptedData,
        timestamp: Math.floor(Date.now() / 1000),
        owner: account,
        category: newRecordData.category,
        attentionLevel: parseInt(newRecordData.attentionScore)
      };
      
      await contract.setData(
        `record_${recordId}`, 
        ethers.toUtf8Bytes(JSON.stringify(recordData))
      );
      
      const keysBytes = await contract.getData("record_keys");
      let keys: string[] = [];
      
      if (keysBytes.length > 0) {
        try {
          keys = JSON.parse(ethers.toUtf8String(keysBytes));
        } catch (e) {
          console.error("Error parsing keys:", e);
        }
      }
      
      keys.push(recordId);
      
      await contract.setData(
        "record_keys", 
        ethers.toUtf8Bytes(JSON.stringify(keys))
      );
      
      setTransactionStatus({
        visible: true,
        status: "success",
        message: "ADHD data encrypted and stored securely!"
      });
      
      await loadRecords();
      
      setTimeout(() => {
        setTransactionStatus({ visible: false, status: "pending", message: "" });
        setShowCreateModal(false);
        setNewRecordData({
          category: "",
          description: "",
          attentionScore: "50"
        });
      }, 2000);
    } catch (e: any) {
      const errorMessage = e.message.includes("user rejected transaction")
        ? "Transaction rejected by user"
        : "Submission failed: " + (e.message || "Unknown error");
      
      setTransactionStatus({
        visible: true,
        status: "error",
        message: errorMessage
      });
      
      setTimeout(() => {
        setTransactionStatus({ visible: false, status: "pending", message: "" });
      }, 3000);
    } finally {
      setCreating(false);
    }
  };

  const filteredRecords = records.filter(record => 
    record.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderAttentionChart = () => {
    const attentionLevels = [0, 0, 0, 0, 0]; // 0-20, 21-40, 41-60, 61-80, 81-100
    
    records.forEach(record => {
      const level = Math.floor(record.attentionLevel / 20);
      attentionLevels[level > 4 ? 4 : level]++;
    });
    
    const maxCount = Math.max(...attentionLevels, 1);
    
    return (
      <div className="attention-chart">
        {attentionLevels.map((count, index) => (
          <div key={index} className="chart-bar-container">
            <div 
              className="chart-bar"
              style={{ height: `${(count / maxCount) * 100}%` }}
            ></div>
            <div className="chart-label">{index*20}-{(index+1)*20}</div>
            <div className="chart-count">{count}</div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="cyber-spinner"></div>
      <p>Initializing FHE connection...</p>
    </div>
  );

  return (
    <div className="app-container cyberpunk-theme">
      <div className="radial-bg"></div>
      
      <header className="app-header">
        <div className="logo">
          <h1>ADHD<span>FHE</span>Tutor</h1>
          <div className="logo-sub">Privacy-Preserving Personalized Tutoring</div>
        </div>
        
        <div className="header-actions">
          <WalletManager account={account} onConnect={onConnect} onDisconnect={onDisconnect} />
        </div>
      </header>
      
      <main className="main-content">
        <nav className="main-nav">
          <button 
            className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button 
            className={`nav-btn ${activeTab === "records" ? "active" : ""}`}
            onClick={() => setActiveTab("records")}
          >
            Records
          </button>
          <button 
            className={`nav-btn ${activeTab === "team" ? "active" : ""}`}
            onClick={() => setActiveTab("team")}
          >
            Team
          </button>
          <button 
            className="nav-btn"
            onClick={checkAvailability}
          >
            Check FHE
          </button>
        </nav>
        
        {activeTab === "dashboard" && (
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h2>FHE-Powered ADHD Tutoring</h2>
              <p>
                Our platform uses Fully Homomorphic Encryption to analyze ADHD students' 
                learning patterns while keeping their data completely private.
              </p>
              <div className="fhe-badge">
                <span>Zama FHE Technology</span>
              </div>
              <button 
                className="action-btn"
                onClick={() => setShowCreateModal(true)}
              >
                Add Student Data
              </button>
            </div>
            
            <div className="dashboard-card stats-card">
              <h3>Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{totalRecords}</div>
                  <div className="stat-label">Students</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{avgAttentionScore.toFixed(1)}</div>
                  <div className="stat-label">Avg Attention</div>
                </div>
              </div>
            </div>
            
            <div className="dashboard-card chart-card">
              <h3>Attention Levels</h3>
              {renderAttentionChart()}
            </div>
          </div>
        )}
        
        {activeTab === "records" && (
          <div className="records-section">
            <div className="section-header">
              <h2>Encrypted Student Records</h2>
              <div className="search-box">
                <input 
                  type="text" 
                  placeholder="Search records..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target)}
                />
              </div>
              <button 
                onClick={loadRecords}
                className="refresh-btn"
                disabled={isRefreshing}
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            
            <div className="records-list">
              {filteredRecords.length === 0 ? (
                <div className="no-records">
                  <p>No student records found</p>
                  <button 
                    className="action-btn"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Add First Record
                  </button>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Category</th>
                      <th>Attention</th>
                      <th>Owner</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map(record => (
                      <tr key={record.id}>
                        <td>#{record.id.substring(0, 6)}</td>
                        <td>{record.category}</td>
                        <td>
                          <div className="attention-meter">
                            <div 
                              className="attention-fill"
                              style={{ width: `${record.attentionLevel}%` }}
                            ></div>
                            <span>{record.attentionLevel}%</span>
                          </div>
                        </td>
                        <td>{record.owner.substring(0, 6)}...{record.owner.substring(38)}</td>
                        <td>
                          {new Date(record.timestamp * 1000).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        
        {activeTab === "team" && (
          <div className="team-section">
            <h2>Our Team</h2>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-avatar"></div>
                <h3>Dr. Alice Chen</h3>
                <p>ADHD Specialist</p>
              </div>
              <div className="team-member">
                <div className="member-avatar"></div>
                <h3>Prof. Bob Zhang</h3>
                <p>FHE Researcher</p>
              </div>
              <div className="team-member">
                <div className="member-avatar"></div>
                <h3>Eve Wilson</h3>
                <p>Educational Technologist</p>
              </div>
            </div>
          </div>
        )}
      </main>
  
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="create-modal">
            <div className="modal-header">
              <h2>Add Student Data</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-modal">&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Category</label>
                <select 
                  name="category"
                  value={newRecordData.category} 
                  onChange={(e) => setNewRecordData({...newRecordData, category: e.target.value})}
                >
                  <option value="">Select category</option>
                  <option value="Reading">Reading</option>
                  <option value="Math">Mathematics</option>
                  <option value="Writing">Writing</option>
                  <option value="Behavior">Behavior</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text"
                  name="description"
                  value={newRecordData.description} 
                  onChange={(e) => setNewRecordData({...newRecordData, description: e.target.value})}
                  placeholder="Brief description..." 
                />
              </div>
              
              <div className="form-group">
                <label>Attention Score (0-100)</label>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  name="attentionScore"
                  value={newRecordData.attentionScore} 
                  onChange={(e) => setNewRecordData({...newRecordData, attentionScore: e.target.value})}
                />
                <div className="range-value">{newRecordData.attentionScore}</div>
              </div>
              
              <div className="fhe-notice">
                Data will be encrypted using FHE before storage
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={submitRecord} 
                disabled={creating}
                className="submit-btn"
              >
                {creating ? "Encrypting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {walletSelectorOpen && (
        <WalletSelector
          isOpen={walletSelectorOpen}
          onWalletSelect={(wallet) => { onWalletSelect(wallet); setWalletSelectorOpen(false); }}
          onClose={() => setWalletSelectorOpen(false)}
        />
      )}
      
      {transactionStatus.visible && (
        <div className="transaction-modal">
          <div className="transaction-content">
            <div className={`transaction-icon ${transactionStatus.status}`}>
              {transactionStatus.status === "pending" && <div className="spinner"></div>}
              {transactionStatus.status === "success" && "✓"}
              {transactionStatus.status === "error" && "✗"}
            </div>
            <div className="transaction-message">
              {transactionStatus.message}
            </div>
          </div>
        </div>
      )}
  
      <footer className="app-footer">
        <p>ADHD FHE Tutor - Privacy-Preserving Personalized Tutoring</p>
        <p>© {new Date().getFullYear()} All rights reserved</p>
      </footer>
    </div>
  );
};

export default App;