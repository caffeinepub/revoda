import AccessControl "./authorization/access-control";
import AuthMixin "./authorization/MixinAuthorization";
import BlobMixin "./blob-storage/Mixin";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";

actor {
  // Authorization
  var _accessControlState = AccessControl.initState();
  include AuthMixin(_accessControlState);

  // Blob Storage
  include BlobMixin();

  // ── Report ──────────────────────────────────────────────
  public type Report = {
    id : Text;
    category : Text;
    description : Text;
    gpsLat : Float;
    gpsLon : Float;
    clientTimestamp : Text;
    deviceId : Text;
    mediaKeys : [Text];
    anonymous : Bool;
    signatureData : Text;
    submittedAt : Int;
  };

  var reports : Map.Map<Text, Report> = Map.empty();
  var reportCounter : Nat = 0;

  public shared func submitReport(
    category : Text,
    description : Text,
    gpsLat : Float,
    gpsLon : Float,
    clientTimestamp : Text,
    deviceId : Text,
    mediaKeys : [Text],
    anonymous : Bool,
    signatureData : Text
  ) : async Text {
    reportCounter += 1;
    let id = "RVD-" # reportCounter.toText();
    let report : Report = {
      id;
      category;
      description;
      gpsLat;
      gpsLon;
      clientTimestamp;
      deviceId;
      mediaKeys;
      anonymous;
      signatureData;
      submittedAt = Time.now();
    };
    reports.add(id, report);
    id
  };

  public query func getReportCount() : async Nat {
    reports.size()
  };

  public shared query ({ caller }) func getReports() : async [Report] {
    if (not AccessControl.isAdmin(_accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    reports.values().toArray()
  };

  public shared query ({ caller }) func getReport(id : Text) : async ?Report {
    if (not AccessControl.isAdmin(_accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    reports.get(id)
  };

  // ── Reform Lobby ─────────────────────────────────────────
  public type ReformItem = {
    id : Text;
    title : Text;
    summary : Text;
    category : Text;
    status : Text;   // "Active" | "Passed" | "Pending"
    evidenceNote : Text;
    petitionCount : Nat;
    submittedBy : Text;
    submittedAt : Int;
  };

  var reformItems : Map.Map<Text, ReformItem> = Map.empty();
  var reformCounter : Nat = 0;

  public shared func submitReformItem(
    title : Text,
    summary : Text,
    category : Text,
    evidenceNote : Text,
    submittedBy : Text
  ) : async Text {
    reformCounter += 1;
    let id = "REF-" # reformCounter.toText();
    let item : ReformItem = {
      id;
      title;
      summary;
      category;
      status = "Pending";
      evidenceNote;
      petitionCount = 0;
      submittedBy;
      submittedAt = Time.now();
    };
    reformItems.add(id, item);
    id
  };

  public shared func signPetition(id : Text) : async Bool {
    switch (reformItems.get(id)) {
      case null { false };
      case (?item) {
        let updated : ReformItem = {
          id = item.id;
          title = item.title;
          summary = item.summary;
          category = item.category;
          status = item.status;
          evidenceNote = item.evidenceNote;
          petitionCount = item.petitionCount + 1;
          submittedBy = item.submittedBy;
          submittedAt = item.submittedAt;
        };
        reformItems.add(id, updated);
        true
      };
    }
  };

  public query func getReformItems() : async [ReformItem] {
    reformItems.values().toArray()
  };

  public shared ({ caller }) func updateReformItemStatus(id : Text, status : Text) : async Bool {
    if (not AccessControl.isAdmin(_accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    switch (reformItems.get(id)) {
      case null { false };
      case (?item) {
        let updated : ReformItem = {
          id = item.id;
          title = item.title;
          summary = item.summary;
          category = item.category;
          status;
          evidenceNote = item.evidenceNote;
          petitionCount = item.petitionCount;
          submittedBy = item.submittedBy;
          submittedAt = item.submittedAt;
        };
        reformItems.add(id, updated);
        true
      };
    }
  };

  // ── Disenfranchisement Archive ───────────────────────────
  public type ArchiveEntry = {
    id : Text;
    caseTitle : Text;
    state : Text;
    lga : Text;
    category : Text;
    description : Text;
    source : Text;
    incidentDate : Text;
    submittedBy : Text;
    submittedAt : Int;
  };

  var archiveEntries : Map.Map<Text, ArchiveEntry> = Map.empty();
  var archiveCounter : Nat = 0;

  public shared func submitArchiveEntry(
    caseTitle : Text,
    state : Text,
    lga : Text,
    category : Text,
    description : Text,
    source : Text,
    incidentDate : Text,
    submittedBy : Text
  ) : async Text {
    archiveCounter += 1;
    let id = "ARC-" # archiveCounter.toText();
    let entry : ArchiveEntry = {
      id;
      caseTitle;
      state;
      lga;
      category;
      description;
      source;
      incidentDate;
      submittedBy;
      submittedAt = Time.now();
    };
    archiveEntries.add(id, entry);
    id
  };

  public query func getArchiveEntries() : async [ArchiveEntry] {
    archiveEntries.values().toArray()
  };

  // Aggregated public stats derived from submitted reports
  public type PublicStats = {
    totalReports : Nat;
    byCategory : [(Text, Nat)];
  };

  public query func getPublicStats() : async PublicStats {
    var categoryMap : Map.Map<Text, Nat> = Map.empty();
    for (r in reports.values()) {
      let prev = switch (categoryMap.get(r.category)) {
        case null { 0 };
        case (?n) { n };
      };
      categoryMap.add(r.category, prev + 1);
    };
    {
      totalReports = reports.size();
      byCategory = categoryMap.entries().toArray();
    }
  };
}
