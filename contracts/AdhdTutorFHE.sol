// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract AdhdTutorFHE is SepoliaConfig {
    struct EncryptedStudentData {
        uint256 studentId;
        euint32 encryptedAttentionScore;   // Encrypted attention level
        euint32 encryptedLearningStyle;    // Encrypted learning style preference
        euint32 encryptedProgress;         // Encrypted progress metric
        uint256 timestamp;
    }
    
    struct PersonalizedStrategy {
        string teachingMethod;
        string toolsRecommendation;
        string scheduleSuggestion;
        bool isRevealed;
    }

    uint256 public studentCount;
    mapping(uint256 => EncryptedStudentData) public encryptedStudentData;
    mapping(uint256 => PersonalizedStrategy) public strategies;
    
    mapping(string => euint32) private encryptedMethodCount;
    string[] private methodList;
    
    mapping(uint256 => uint256) private requestToStudentId;
    
    event DataSubmitted(uint256 indexed studentId, uint256 timestamp);
    event StrategyRequested(uint256 indexed studentId);
    event StrategyGenerated(uint256 indexed studentId);
    
    modifier onlyAuthorized(uint256 studentId) {
        // Add access control logic here
        _;
    }
    
    function submitEncryptedData(
        euint32 encryptedAttentionScore,
        euint32 encryptedLearningStyle,
        euint32 encryptedProgress
    ) public {
        studentCount += 1;
        uint256 newId = studentCount;
        
        encryptedStudentData[newId] = EncryptedStudentData({
            studentId: newId,
            encryptedAttentionScore: encryptedAttentionScore,
            encryptedLearningStyle: encryptedLearningStyle,
            encryptedProgress: encryptedProgress,
            timestamp: block.timestamp
        });
        
        strategies[newId] = PersonalizedStrategy({
            teachingMethod: "",
            toolsRecommendation: "",
            scheduleSuggestion: "",
            isRevealed: false
        });
        
        emit DataSubmitted(newId, block.timestamp);
    }
    
    function requestPersonalizedStrategy(uint256 studentId) public onlyAuthorized(studentId) {
        EncryptedStudentData storage data = encryptedStudentData[studentId];
        require(!strategies[studentId].isRevealed, "Strategy already generated");
        
        bytes32[] memory ciphertexts = new bytes32[](3);
        ciphertexts[0] = FHE.toBytes32(data.encryptedAttentionScore);
        ciphertexts[1] = FHE.toBytes32(data.encryptedLearningStyle);
        ciphertexts[2] = FHE.toBytes32(data.encryptedProgress);
        
        uint256 reqId = FHE.requestDecryption(ciphertexts, this.generateStrategy.selector);
        requestToStudentId[reqId] = studentId;
        
        emit StrategyRequested(studentId);
    }
    
    function generateStrategy(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory proof
    ) public {
        uint256 studentId = requestToStudentId[requestId];
        require(studentId != 0, "Invalid request");
        
        PersonalizedStrategy storage strategy = strategies[studentId];
        require(!strategy.isRevealed, "Strategy already generated");
        
        FHE.checkSignatures(requestId, cleartexts, proof);
        
        uint32[] memory results = abi.decode(cleartexts, (uint32[]));
        
        // Simplified strategy generation based on decrypted values
        strategy.teachingMethod = determineTeachingMethod(results[0], results[1]);
        strategy.toolsRecommendation = determineTools(results[0], results[2]);
        strategy.scheduleSuggestion = determineSchedule(results[0]);
        strategy.isRevealed = true;
        
        if (FHE.isInitialized(encryptedMethodCount[strategy.teachingMethod]) == false) {
            encryptedMethodCount[strategy.teachingMethod] = FHE.asEuint32(0);
            methodList.push(strategy.teachingMethod);
        }
        encryptedMethodCount[strategy.teachingMethod] = FHE.add(
            encryptedMethodCount[strategy.teachingMethod], 
            FHE.asEuint32(1)
        );
        
        emit StrategyGenerated(studentId);
    }
    
    function getStrategy(uint256 studentId) public view returns (
        string memory teachingMethod,
        string memory toolsRecommendation,
        string memory scheduleSuggestion,
        bool isRevealed
    ) {
        PersonalizedStrategy storage s = strategies[studentId];
        return (s.teachingMethod, s.toolsRecommendation, s.scheduleSuggestion, s.isRevealed);
    }
    
    function getEncryptedMethodCount(string memory method) public view returns (euint32) {
        return encryptedMethodCount[method];
    }
    
    function requestMethodCountDecryption(string memory method) public {
        euint32 count = encryptedMethodCount[method];
        require(FHE.isInitialized(count), "Method not found");
        
        bytes32[] memory ciphertexts = new bytes32[](1);
        ciphertexts[0] = FHE.toBytes32(count);
        
        uint256 reqId = FHE.requestDecryption(ciphertexts, this.decryptMethodCount.selector);
        requestToStudentId[reqId] = bytes32ToUint(keccak256(abi.encodePacked(method)));
    }
    
    function decryptMethodCount(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory proof
    ) public {
        uint256 methodHash = requestToStudentId[requestId];
        string memory method = getMethodFromHash(methodHash);
        
        FHE.checkSignatures(requestId, cleartexts, proof);
        uint32 count = abi.decode(cleartexts, (uint32));
    }
    
    // Helper functions for strategy generation
    function determineTeachingMethod(uint32 attention, uint32 learningStyle) private pure returns (string memory) {
        if (attention < 30) return "Multisensory";
        if (learningStyle == 1) return "Visual";
        if (learningStyle == 2) return "Auditory";
        return "Kinesthetic";
    }
    
    function determineTools(uint32 attention, uint32 progress) private pure returns (string memory) {
        if (attention < 40) return "Focus timer + Text-to-speech";
        if (progress < 50) return "Interactive exercises";
        return "Gamified learning";
    }
    
    function determineSchedule(uint32 attention) private pure returns (string memory) {
        if (attention < 30) return "25-min sessions with 5-min breaks";
        if (attention < 60) return "45-min sessions with 10-min breaks";
        return "60-min sessions with 15-min breaks";
    }
    
    function bytes32ToUint(bytes32 b) private pure returns (uint256) {
        return uint256(b);
    }
    
    function getMethodFromHash(uint256 hash) private view returns (string memory) {
        for (uint i = 0; i < methodList.length; i++) {
            if (bytes32ToUint(keccak256(abi.encodePacked(methodList[i]))) == hash) {
                return methodList[i];
            }
        }
        revert("Method not found");
    }
}